from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from google import genai
from google.genai import types
import os
import asyncio
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cramnix_backend")

app = FastAPI(title="Cramnix AI Backend V2", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")


class PromptRequest(BaseModel):
    prompt: str
    api_key: Optional[str] = None
    system_instruction: Optional[str] = None
    model: Optional[str] = None


@app.get("/")
def read_root():
    return {"message": "Cramnix AI FastAPI Backend is running successfully!"}


@app.get("/health")
def health_check():
    return {"status": "ok", "default_model": DEFAULT_MODEL}


@app.post("/api/generate")
async def generate_ai_content(data: PromptRequest):
    step = "api_key_check"
    api_key = (data.api_key or os.getenv("GEMINI_API_KEY") or "").strip()
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail=f"[{step}] Gemini API Key missing hai.",
        )

    step = "prompt_check"
    prompt_text = (data.prompt or "").strip()
    if not prompt_text:
        raise HTTPException(
            status_code=400,
            detail=f"[{step}] Prompt empty hai.",
        )

    step = "client_init"
    target_model = (data.model or DEFAULT_MODEL).strip()
    try:
        client = genai.Client(api_key=api_key)
        config = None
        if data.system_instruction:
            config = types.GenerateContentConfig(
                system_instruction=data.system_instruction
            )
    except Exception as e:
        logger.exception("Error during client initialization")
        raise HTTPException(
            status_code=500,
            detail=f"[{step}] Client init error: {str(e)}",
        )

    def _call_gemini() -> str:
        res = client.models.generate_content(
            model=target_model,
            contents=prompt_text,
            config=config,
        )
        return getattr(res, "text", "") or ""

    max_retries = 3
    delay = 2.0

    for attempt in range(1, max_retries + 1):
        step = f"gemini_api_call_attempt_{attempt}"
        try:
            logger.info("Calling model '%s' (attempt %d/%d)", target_model, attempt, max_retries)
            text_out = await asyncio.to_thread(_call_gemini)
            if not text_out.strip():
                raise RuntimeError("Model ne empty response diya.")
            return {"response": text_out, "model": target_model}
        except Exception as e:
            err_detail = f"[{step} | model={target_model}] {type(e).__name__}: {str(e)}"
            logger.error(err_detail)
            if attempt < max_retries:
                await asyncio.sleep(delay)
                delay *= 2
            else:
                raise HTTPException(status_code=502, detail=err_detail)