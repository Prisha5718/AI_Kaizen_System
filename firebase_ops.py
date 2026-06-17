from datetime import datetime, timezone

import firebase_admin
from firebase_admin import credentials, firestore


DEFAULT_USERS = [
    {
        "userId": "EMP001",
        "name": "Rahul Sharma",
        "password": "123456",
        "role": "employee",
    },
    {
        "userId": "EMP002",
        "name": "EMP002",
        "password": "123456",
        "role": "employee",
    },
    {
        "userId": "EMP003",
        "name": "EMP003",
        "password": "123456",
        "role": "employee",
    },
    {
        "userId": "MGR001",
        "name": "Admin User",
        "password": "admin123",
        "role": "manager",
    },
]


def _get_client():
    if not firebase_admin._apps:
        cred = credentials.Certificate(
            "ai-kaizen-system-firebase-adminsdk-fbsvc-f9eca0d78a.json"
        )
        firebase_admin.initialize_app(cred)
    return firestore.client()


db = _get_client()


def serialize_doc(doc):
    data = doc.to_dict() or {}
    data["id"] = doc.id
    if "translatedText" not in data and "translated_text" in data:
        data["translatedText"] = data.get("translated_text")
    if "originalText" not in data and "original_text" in data:
        data["originalText"] = data.get("original_text")
    timestamp = data.get("timestamp")
    if hasattr(timestamp, "isoformat"):
        data["timestamp"] = timestamp.isoformat()
    return data


def seed_default_users():
    for user in DEFAULT_USERS:
        ref = db.collection("users").document(user["userId"])
        if not ref.get().exists:
            ref.set(user)


def authenticate_user(user_id, password):
    seed_default_users()
    if not user_id or not password:
        return None

    doc = db.collection("users").document(user_id).get()
    if not doc.exists:
        return None

    user = doc.to_dict() or {}
    if user.get("password") != password:
        return None

    return {
        "userId": user.get("userId", user_id),
        "name": user.get("name", ""),
        "role": user.get("role", ""),
    }


def create_employee_user(user_id, name, password):
    seed_default_users()
    if not user_id or not name or not password:
        raise ValueError("Employee ID, employee name, and password are required")

    normalized_user_id = user_id.strip()
    ref = db.collection("users").document(normalized_user_id)
    if ref.get().exists:
        raise ValueError("Employee ID already exists")

    user = {
        "userId": normalized_user_id,
        "name": name.strip(),
        "password": password,
        "role": "employee",
    }
    ref.set(user)
    return {
        "userId": user["userId"],
        "name": user["name"],
        "role": user["role"],
    }


def create_suggestion(data):
    payload = {
        "employeeId": data["employeeId"],
        "employeeName": data["employeeName"],
        "originalText": data["originalText"],
        "translatedText": data["translatedText"],
        "category": data["category"],
        "priority": data["priority"],
        "status": data.get("status", "Pending"),
        "timestamp": datetime.now(timezone.utc),
        "language": data["language"],
    }
    _, ref = db.collection("suggestions").add(payload)
    return get_suggestion(ref.id)


def get_suggestion(suggestion_id):
    doc = db.collection("suggestions").document(suggestion_id).get()
    if not doc.exists:
        return None
    return serialize_doc(doc)


def list_suggestions():
    docs = (
        db.collection("suggestions")
        .order_by("timestamp", direction=firestore.Query.DESCENDING)
        .stream()
    )
    return [serialize_doc(doc) for doc in docs]


def list_employee_suggestions(employee_id):
    docs = db.collection("suggestions").where("employeeId", "==", employee_id).stream()
    suggestions = [serialize_doc(doc) for doc in docs]
    return sorted(
        suggestions,
        key=lambda item: item.get("timestamp") or "",
        reverse=True,
    )


def update_suggestion_status(suggestion_id, status):
    allowed = {"Pending", "In Review", "Implemented", "Rejected"}
    if status not in allowed:
        raise ValueError("Invalid status")

    ref = db.collection("suggestions").document(suggestion_id)
    if not ref.get().exists:
        return None

    ref.update({"status": status})
    return get_suggestion(suggestion_id)


def delete_suggestion(suggestion_id):
    ref = db.collection("suggestions").document(suggestion_id)
    if not ref.get().exists:
        return False

    ref.delete()
    return True
