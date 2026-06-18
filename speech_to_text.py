import os
from pathlib import Path

import requests


GROQ_TRANSCRIPTIONS_URL = "https://api.groq.com/openai/v1/audio/transcriptions"
GROQ_WHISPER_MODEL = os.environ.get("GROQ_WHISPER_MODEL", "whisper-large-v3-turbo")


def transcribe_audio(audio_path):
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not configured")

    path = Path(audio_path)
    if not path.exists():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    with path.open("rb") as audio_file:
        response = requests.post(
            GROQ_TRANSCRIPTIONS_URL,
            headers={"Authorization": f"Bearer {api_key}"},
            data={
                "model": GROQ_WHISPER_MODEL,
                "response_format": "verbose_json",
            },
            files={"file": (path.name, audio_file)},
            timeout=90,
        )

    try:
        payload = response.json()
    except ValueError:
        payload = {}

    if response.status_code >= 400:
        message = payload.get("error", {}).get("message") if isinstance(payload.get("error"), dict) else None
        raise RuntimeError(message or payload.get("error") or response.text or "Groq transcription failed")

    transcript = (payload.get("text") or "").strip()
    language = payload.get("language") or "unknown"

    if not transcript:
        raise RuntimeError("Groq transcription returned an empty transcript")

    return transcript, language
