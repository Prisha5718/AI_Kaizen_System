from speech_to_text import transcribe_audio

text, lang = transcribe_audio(
    "audio/Recording2.wav"
)

print("Language:")
print(lang)

print("\nTranscript:")
print(text)