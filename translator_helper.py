def normalize_text(text):

    text = text.lower()

    replacements = {

        "leak thaayi chhe": "is leaking",
        "leak thay che": "is leaking",

        "oil leakage hai": "oil leakage",
        "oil leakage chhe": "oil leakage",

        "ke paas": "near",

        "bandh hai": "stopped",
        "bandh chhe": "stopped",

        "garam hai": "overheating",
        "garam chhe": "overheating"
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    return text


def translate_to_english(text):
    if not text:
        return ""

    from deep_translator import GoogleTranslator

    return GoogleTranslator(source="auto", target="en").translate(text)


def translate_from_english(text, target_language):
    if not text:
        return ""

    target = (target_language or "en").lower()
    if target == "en":
        return text

    from deep_translator import GoogleTranslator

    return GoogleTranslator(source="en", target=target).translate(text)
