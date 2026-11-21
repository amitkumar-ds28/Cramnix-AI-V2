from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from google import genai
from google.genai import types
import os
import asyncio
import urllib.request
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

DEFAULT_SYSTEM_INSTRUCTION = (
    "You are Cramnix AI, a helpful, clear, and well-structured study and coding assistant. "
    "Match the user's language (English, Hindi, or Hinglish) and follow any length or format constraints "
    "explicitly requested in the prompt (such as short points or specific counts). "
    "When no strict short limit is requested, give a clear, thorough, and well-organized answer with "
    "clear explanations. Put code inside fenced code blocks (```language ... ```) with complete, runnable code "
    "and keep explanations outside the code blocks."
)


async def _keep_alive_loop():
    base_url = (
        os.getenv("RENDER_EXTERNAL_URL")
        or os.getenv("BACKEND_URL")
        or "https://cramnix-ai-v2.onrender.com"
    ).rstrip("/")
    health_url = f"{base_url}/health"

    # Initial startup settlement wait
    await asyncio.sleep(30)
    while True:
        try:
            await asyncio.to_thread(
                lambda: urllib.request.urlopen(health_url, timeout=15).read()
            )
        except Exception:
            pass
        await asyncio.sleep(240)  # every 4 minutes


@asynccontextmanager
async def lifespan(app: FastAPI):
    keep_alive_task = asyncio.create_task(_keep_alive_loop())
    try:
        yield
    finally:
        keep_alive_task.cancel()
        try:
            await keep_alive_task
        except asyncio.CancelledError:
            pass


app = FastAPI(
    title="Cramnix AI Backend V2",
    version="2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DAILY_LIMIT_MESSAGE = (
    "Free daily limit (20 requests) has been reached. "
    "Please use your own Gemini API key in Settings to continue."
)


class PromptRequest(BaseModel):
    prompt: str
    api_key: Optional[str] = None
    system_instruction: Optional[str] = None


@app.get("/")
def read_root():
    return {"message": "Cramnix AI FastAPI Backend is running successfully!"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


def _is_daily_limit_exhausted(msg: str) -> bool:
    lower = msg.lower()
    return (
        "generate_content_free_tier_requests" in lower
        or "per day" in lower
        or "requests per day" in lower
        or "daily" in lower
    )


@app.post("/api/generate")
async def generate_ai_content(data: PromptRequest):
    api_key = (data.api_key or "").strip() or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="Gemini API key is missing. Please add your own Gemini API key in Settings to continue.",
        )

    client = genai.Client(api_key=api_key)
    effective_instruction = (
        data.system_instruction.strip()
        if data.system_instruction and data.system_instruction.strip()
        else DEFAULT_SYSTEM_INSTRUCTION
    )
    config = types.GenerateContentConfig(
        system_instruction=effective_instruction
    )

    # Patient retry loop until answer arrives or quota/limit is exhausted
    max_retries = 35
    delay = 6

    for attempt in range(max_retries):
        try:
            response = await asyncio.to_thread(
                lambda: client.models.generate_content(
                    model="gemini-3.8-flash",
                    contents=data.prompt,
                    config=config,
                )
            )
            text = getattr(response, "text", None)
            if not text or not text.strip():
                if attempt < max_retries - 1:
                    await asyncio.sleep(delay)
                    delay = min(delay + 2, 12)
                    continue
                raise HTTPException(
                    status_code=502,
                    detail="No response was returned by the model. Please try again or use your own Gemini API key in Settings.",
                )
            return {"response": text}

        except HTTPException:
            raise
        except Exception as e:
            error_message = str(e)

            if (
                "401" in error_message
                or "UNAUTHENTICATED" in error_message
                or "API_KEY_INVALID" in error_message
            ):
                raise HTTPException(
                    status_code=401,
                    detail="Your Gemini API key is invalid or unauthorized. Please check or enter your own Gemini API key in Settings.",
                )

            if "429" in error_message or "RESOURCE_EXHAUSTED" in error_message:
                if _is_daily_limit_exhausted(error_message):
                    raise HTTPException(
                        status_code=429,
                        detail=DAILY_LIMIT_MESSAGE,
                    )
                if attempt < max_retries - 1:
                    await asyncio.sleep(delay)
                    delay = min(delay + 2, 12)
                    continue
                raise HTTPException(
                    status_code=429,
                    detail=DAILY_LIMIT_MESSAGE,
                )

            if attempt < max_retries - 1:
                await asyncio.sleep(delay)
                delay = min(delay + 2, 12)
                continue

            raise HTTPException(
                status_code=500,
                detail="Unable to generate a response right now. Please try again or use your own Gemini API key in Settings.",
            )