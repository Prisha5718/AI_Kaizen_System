import os
import shutil
import subprocess

import whisper

model = None
ffmpeg_exe = None
original_subprocess_run = subprocess.run


def configure_ffmpeg():
    global ffmpeg_exe
    if shutil.which("ffmpeg"):
        ffmpeg_exe = "ffmpeg"
        return

    try:
        import imageio_ffmpeg
    except ImportError as exc:
        raise RuntimeError(
            "Audio processing needs ffmpeg. Install it or run: pip install imageio-ffmpeg"
        ) from exc

    ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
    ffmpeg_exe = ffmpeg_path
    os.environ["PATH"] = f"{os.path.dirname(ffmpeg_path)}{os.pathsep}{os.environ.get('PATH', '')}"


def run_with_bundled_ffmpeg(command, *args, **kwargs):
    if ffmpeg_exe and isinstance(command, list) and command and command[0] == "ffmpeg":
        command = [ffmpeg_exe, *command[1:]]
    return original_subprocess_run(command, *args, **kwargs)


def get_model():
    global model
    if model is None:
        model = whisper.load_model("medium")
    return model


def transcribe_audio(audio_path):
    configure_ffmpeg()
    subprocess.run = run_with_bundled_ffmpeg
    try:
        result = get_model().transcribe(audio_path)
    finally:
        subprocess.run = original_subprocess_run

    language = result["language"]
    transcript = result["text"].strip()

    return transcript, language
