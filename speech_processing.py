from categorizer import categorize_suggestion
from priority_detector import detect_priority
from translator_helper import normalize_text, translate_to_english
import os

# For faster local testing without heavy whisper dependencies, set SKIP_TRANSCRIBE=1
# This will skip importing `speech_to_text` (which requires `whisper`/`torch`) and
# return a simple placeholder transcription so the app endpoints remain testable.


LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "gu": "Gujarati",
    "mr": "Marathi",
    "ta": "Tamil",
    "te": "Telugu",
}


def display_language(language_code):
    return LANGUAGE_NAMES.get(language_code, language_code or "Unknown")


def process_audio(audio_path):
    skip = os.environ.get("SKIP_TRANSCRIBE")
    with open('debug_requests.log', 'a', encoding='utf-8') as f:
        f.write(f'DEBUG process_audio SKIP_TRANSCRIBE={skip}; audio_path={audio_path}\n')
    print('DEBUG process_audio SKIP_TRANSCRIBE=', skip, 'audio_path=', audio_path, flush=True)
    if skip == "1":
        original_text = "Test suggestion from audio"
        language_code = "en"
    else:
        from speech_to_text import transcribe_audio
        original_text, language_code = transcribe_audio(audio_path)
    translated_text = translate_to_english(normalize_text(original_text))

    return {
        "originalText": original_text,
        "translatedText": translated_text,
        "language": display_language(language_code),
        "category": categorize_suggestion(translated_text),
        "priority": detect_priority(translated_text),
    }
