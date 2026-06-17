from collections import Counter
from datetime import datetime, timezone


CATEGORIES = ["Safety", "Quality", "Productivity", "Maintenance", "Cost Saving"]
PRIORITIES = ["Critical", "High", "Medium", "Low"]
STATUSES = ["Pending", "In Review", "Implemented", "Rejected"]


def _normalized_category(value):
    if value == "Cost Reduction":
        return "Cost Saving"
    return value or "General Improvement"


def _is_today(value):
    if not value:
        return False
    try:
        timestamp = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return False
    return timestamp.date() == datetime.now(timezone.utc).date()


def build_analytics(suggestions):
    categories = Counter(_normalized_category(item.get("category")) for item in suggestions)
    priorities = Counter(item.get("priority", "Low") for item in suggestions)
    statuses = Counter(item.get("status", "Pending") for item in suggestions)

    return {
        "total": len(suggestions),
        "today": sum(1 for item in suggestions if _is_today(item.get("timestamp"))),
        "pending": statuses.get("Pending", 0),
        "critical": priorities.get("Critical", 0),
        "implemented": statuses.get("Implemented", 0),
        "categoryDistribution": {key: categories.get(key, 0) for key in CATEGORIES},
        "priorityDistribution": {key: priorities.get(key, 0) for key in PRIORITIES},
        "statusDistribution": {key: statuses.get(key, 0) for key in STATUSES},
    }
