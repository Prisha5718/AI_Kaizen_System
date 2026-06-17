
def categorize_suggestion(text):

    text = text.lower()

    if any(word in text for word in [
        "leak", "leakage", "oil", "fire",
        "hazard", "accident", "injury", "safety"
    ]):
        return "Safety"

    elif any(word in text for word in [
        "quality", "defect", "inspection",
        "error", "rework"
    ]):
        return "Quality"

    elif any(word in text for word in [
        "delay", "waiting", "slow",
        "efficiency", "productivity"
    ]):
        return "Productivity"

    elif any(word in text for word in [
        "waste", "material", "cost",
        "scrap"
    ]):
        return "Cost Saving"

    elif any(word in text for word in [
        "maintenance", "repair",
        "breakdown", "machine"
    ]):
        return "Maintenance"

    else:
        return "General Improvement"
