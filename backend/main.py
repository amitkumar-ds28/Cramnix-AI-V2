from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from google import genai
from google.genai import types
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Cramnix AI Backend V2", version="2.0")

ALLOWED_ORIGINS = [
    "https://cramnix.me",
    "https://www.cramnix.me",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PromptRequest(BaseModel):
    prompt: str
    api_key: Optional[str] = None
    system_instruction: Optional[str] = None


def _call_gemini(api_key: str, prompt: str, system_instruction: Optional[str]) -> str:
    client = genai.Client(api_key=api_key.strip())
    config = (
        types.GenerateContentConfig(system_instruction=system_instruction)
        if system_instruction
        else None
    )
    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt,
        config=config,
    )
    return response.text or ""


@app.get("/")
def read_root():
    return {"message": "Cramnix AI FastAPI Backend is running successfully!"}


@app.post("/api/generate")
async def generate_ai_content(data: PromptRequest):
    api_key = (data.api_key or os.getenv("GEMINI_API_KEY") or "").strip()
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="Gemini API Key is missing. Please provide a valid key.",
        )

    prompt = (data.prompt or "").strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    max_retries = 2
    delay = 1.0

    for attempt in range(max_retries):
        try:
            text = await asyncio.to_thread(
                _call_gemini, api_key, prompt, data.system_instruction
            )
            return {"response": text}
        except Exception as e:
            error_message = str(e)
            if attempt < max_retries - 1:
                await asyncio.sleep(delay)
                delay *= 2
                continue
            raise HTTPException(status_code=500, detail=error_message)