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


@app.get("/health")
def health_check():
    return {"status": "ok"}


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

    # Temporary high-demand (503) ke liye backoff delays (total ~30s ke andar retries)
    retry_delays = [2, 4, 6, 8, 10]
    last_err_msg = ""

    for attempt, delay in enumerate([0] + retry_delays):
        if delay > 0:
            await asyncio.sleep(delay)

        try:
            text = await asyncio.to_thread(
                _call_gemini, api_key, prompt, data.system_instruction
            )
            return {"response": text}

        except Exception as e:
            err_msg = f"{type(e).__name__}: {str(e)}"
            last_err_msg = err_msg
            print(f"GEMINI ERROR (attempt {attempt + 1}):", err_msg, flush=True)

            # Daily/rate quota exceed hone par turant 429 bhejo
            if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
                raise HTTPException(status_code=429, detail=err_msg)

            # Temporary 503 UNAVAILABLE ho toh retries baaki hain toh loop continue karo
            is_503 = "503" in err_msg or "UNAVAILABLE" in err_msg
            if is_503 and attempt < len(retry_delays):
                continue

            status_code = 503 if is_503 else 500
            raise HTTPException(status_code=status_code, detail=err_msg)

    raise HTTPException(status_code=503, detail=last_err_msg or "Service unavailable")