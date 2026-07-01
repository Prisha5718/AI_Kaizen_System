import json
import os
from datetime import datetime, timezone

import firebase_admin
from firebase_admin import credentials, firestore


DEFAULT_USERS = [
    {
        "company": "IFQM",
        "userId": "EMP001",
        "name": "Rahul Sharma",
        "password": "123456",
        "role": "employee",
    },
    {
        "company": "IFQM",
        "userId": "EMP002",
        "name": "EMP002",
        "password": "123456",
        "role": "employee",
    },
    {
        "company": "IFQM",
        "userId": "EMP003",
        "name": "EMP003",
        "password": "123456",
        "role": "employee",
    },
    {
        "company": "IFQM",
        "userId": "MGR001",
        "name": "Admin User",
        "password": "admin123",
        "role": "manager",
    },
    {
        "company": "TCS",
        "userId": "MGR001",
        "name": "TCS Manager",
        "password": "admin123",
        "role": "manager",
    },
    {
        "company": "Infosys",
        "userId": "MGR001",
        "name": "Infosys Manager",
        "password": "admin123",
        "role": "manager",
    },
    {
        "company": "Wipro",
        "userId": "MGR001",
        "name": "Wipro Manager",
        "password": "admin123",
        "role": "manager",
    },
]


REQUIRED_SUGGESTION_FIELDS = (
    "company",
    "employeeId",
    "employeeName",
    "originalText",
    "translatedText",
    "category",
    "priority",
    "language",
)


def normalize_identifier(value):
    return str(value or "").strip()


def user_document_id(company, user_id):
    normalized_company = normalize_identifier(company)
    normalized_user_id = normalize_identifier(user_id)
    if not normalized_company or not normalized_user_id:
        raise ValueError("Company and user ID are required")
    if "/" in normalized_company or "/" in normalized_user_id:
        raise ValueError("Company and user ID cannot contain slashes")
    return f"{normalized_company}_{normalized_user_id}"

def _get_client():
    if not firebase_admin._apps:
        firebase_json = os.environ.get("FIREBASE_CREDENTIALS")

        if firebase_json:
            cred_dict = json.loads(firebase_json)
            cred = credentials.Certificate(cred_dict)
        else:
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
        document_id = user_document_id(user["company"], user["userId"])
        ref = db.collection("users").document(document_id)
        if not ref.get().exists:
            ref.set(user)


def authenticate_user(company, user_id, password):
    seed_default_users()
    if not company or not user_id or not password:
        return None

    normalized_company = normalize_identifier(company)
    normalized_user_id = normalize_identifier(user_id)
    document_id = user_document_id(normalized_company, normalized_user_id)

    doc = db.collection("users").document(document_id).get()
    if not doc.exists:
        return None

    user = doc.to_dict() or {}
    if user.get("password") != password:
        return None

    return {
        "company": user.get("company", normalized_company),
        "userId": user.get("userId", user_id),
        "name": user.get("name", ""),
        "role": user.get("role", ""),
    }


def create_employee_user(company, user_id, name, password):
    seed_default_users()
    if not company or not user_id or not name or not password:
        raise ValueError("Company, employee ID, employee name, and password are required")

    normalized_company = normalize_identifier(company)
    normalized_user_id = normalize_identifier(user_id)
    document_id = user_document_id(normalized_company, normalized_user_id)
    ref = db.collection("users").document(document_id)
    if ref.get().exists:
        raise ValueError("User already exists for this company")

    user = {
        "company": normalized_company,
        "userId": normalized_user_id,
        "name": name.strip(),
        "password": password,
        "role": "employee",
    }
    ref.set(user)
    return {
        "company": user["company"],
        "userId": user["userId"],
        "name": user["name"],
        "role": user["role"],
    }


def create_suggestion(data):
    missing = [field for field in REQUIRED_SUGGESTION_FIELDS if not data.get(field)]
    if missing:
        raise ValueError(f"Missing suggestion fields: {', '.join(missing)}")

    payload = {
        "company": normalize_identifier(data["company"]),
        "employeeId": normalize_identifier(data["employeeId"]),
        "employeeName": normalize_identifier(data["employeeName"]),
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


def list_employee_suggestions(company, employee_id):
    docs = (
        db.collection("suggestions")
        .where("company", "==", normalize_identifier(company))
        .where("employeeId", "==", normalize_identifier(employee_id))
        .stream()
    )
    suggestions = [serialize_doc(doc) for doc in docs]

    return sorted(
        suggestions,
        key=lambda item: item.get("timestamp") or "",
        reverse=True,
    )

def list_company_suggestions(company):
    docs = (
        db.collection("suggestions")
        .where("company", "==", normalize_identifier(company))
        .stream()
    )

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
