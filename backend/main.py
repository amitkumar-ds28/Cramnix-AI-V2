from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from google import genai
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Cramnix AI Backend V2", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
    prompt: str
    api_key: Optional[str] = None
    system_instruction: Optional[str] = None

@app.get("/")
def read_root():
    return {"message": "Cramnix AI FastAPI Backend is running successfully!"}

@app.post("/api/generate")
async def generate_ai_content(data: PromptRequest):
    api_key = data.api_key or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=400, detail="Gemini API Key is missing. Please provide a valid key.")
    
    client = genai.Client(api_key=api_key)
    
    max_retries = 5
    delay = 3
    
    for attempt in range(max_retries):
        try:
            # Aapka wahi pasandida gemini-3.8-flash model
            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=data.prompt
            )
            return {"response": response.text}
        except Exception as e:
            error_message = str(e)
            if attempt < max_retries - 1:
                await asyncio.sleep(delay)
                delay *= 2
                continue
            else:
                raise HTTPException(status_code=500, detail=error_message)