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


def _is_daily_limit_exhausted(msg: str) -> bool:
    lower = msg.lower()
    return (
        "generate_content_free_tier_requests" in lower
        or "per day" in lower
        or "daily" in lower
        or ("quota exceeded" in lower and "limit: 20" in lower)
    )


def _is_retryable_error(msg: str) -> bool:
    lower = msg.lower()
    return (
        "503" in lower
        or "unavailable" in lower
        or "high demand" in lower
        or "overloaded" in lower
        or "temporarily" in lower
        or "timeout" in lower
        or "timed out" in lower
        or "connection" in lower
        or "reset" in lower
        or "500" in lower
        or "internal" in lower
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
    config = None
    if data.system_instruction:
        config = types.GenerateContentConfig(
            system_instruction=data.system_instruction
        )

    # Patient retry loop (~3-4 minutes) so temporary load or spikes still return an answer
    max_retries = 24
    delay = 6

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=data.prompt,
                config=config,
            )
            text = getattr(response, "text", None)
            if not text:
                if attempt < max_retries - 1:
                    await asyncio.sleep(delay)
                    delay = min(delay + 4, 15)
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

            if "401" in error_message or "UNAUTHENTICATED" in error_message or "API_KEY_INVALID" in error_message:
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
                    delay = min(delay + 4, 15)
                    continue
                raise HTTPException(
                    status_code=429,
                    detail=DAILY_LIMIT_MESSAGE,
                )

            if _is_retryable_error(error_message) and attempt < max_retries - 1:
                await asyncio.sleep(delay)
                delay = min(delay + 4, 15)
                continue

            if attempt < max_retries - 1:
                await asyncio.sleep(delay)
                delay = min(delay + 4, 15)
                continue

            raise HTTPException(
                status_code=500,
                detail="Unable to generate a response right now. Please try again or use your own Gemini API key in Settings.",
            )