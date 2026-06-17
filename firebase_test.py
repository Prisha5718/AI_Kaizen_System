import firebase_admin
from firebase_admin import credentials, firestore

# Replace with your actual JSON filename
cred = credentials.Certificate(
    "ai-kaizen-system-firebase-adminsdk-fbsvc-f9eca0d78a.json"
)

firebase_admin.initialize_app(cred)

db = firestore.client()

# Test document
data = {
    "message": "Firebase Connected Successfully",
    "status": "success"
}

db.collection("test").add(data)

print("Data stored successfully!")