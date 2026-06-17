def detect_priority(text):

    text = text.lower()

    if any(word in text for word in [
        "fire",
        "explosion",
        "electric shock",
        "gas leak"
    ]):
        return "Critical"

    elif any(word in text for word in [
        "leak",
        "hazard",
        "breakdown",
        "safety"
    ]):
        return "High"

    elif any(word in text for word in [
        "delay",
        "waiting",
        "slow"
    ]):
        return "Medium"

    else:
        return "Low"