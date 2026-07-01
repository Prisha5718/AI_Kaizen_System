import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate(
    "ai-kaizen-system-firebase-adminsdk-fbsvc-f9eca0d78a.json"
)

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()


def get_suggestions(company):

    docs = db.collection("suggestions").where("company", "==", company).stream()

    suggestions = []

    for doc in docs:
        suggestions.append(doc.to_dict())

    return suggestions
