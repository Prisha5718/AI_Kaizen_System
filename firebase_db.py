import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

cred = credentials.Certificate(
    "ai-kaizen-system-firebase-adminsdk-fbsvc-f9eca0d78a.json"
)

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()


def save_suggestion(
    language,
    original_text,
    translated_text,
    category,
    priority
):

    data = {
        "language": language,
        "original_text": original_text,
        "translated_text": translated_text,
        "category": category,
        "priority": priority,
        "status": "Pending",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    db.collection("suggestions").add(data)

    print("Suggestion saved to Firebase!")