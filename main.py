
from email.mime import audio
import os
import tempfile
import traceback

from dotenv import load_dotenv

load_dotenv()

from flask import Flask, jsonify, request
from werkzeug.exceptions import HTTPException

from analytics import build_analytics
from authentication import login_user
from firebase_ops import (
    create_employee_user,
    create_manager_user,
    create_suggestion,
    delete_suggestion,
    get_suggestion,
    list_company_suggestions,
    list_employee_suggestions,
    update_suggestion_review,
    update_suggestion_status,
)
from speech_processing import process_audio
from translator_helper import translate_from_english


app = Flask(__name__, static_folder="frontend", static_url_path="")


def json_response(payload, status=200):
    response = jsonify(payload)
    response.status_code = status
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response


@app.errorhandler(Exception)
def handle_unexpected_error(exc):
    if isinstance(exc, HTTPException):
        return json_response({"error": exc.description}, exc.code or 500)

    error_text = traceback.format_exc()
    app.logger.exception("Unhandled exception")
    return json_response({"error": str(exc), "traceback": error_text}, 500)


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/health")
def health():
    return json_response({"status": "ok"})


@app.route("/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return json_response({})

    payload = request.get_json(silent=True) or {}
    company = (payload.get("company") or "").strip()
    user_id = (payload.get("userId") or "").strip()
    password = payload.get("password") or ""

    if not company or not user_id or not password:
        return json_response({"error": "All fields are required"}, 400)

    user = login_user(company, user_id, password)
    if not user:
        return json_response({"error": "Invalid company, user ID, or password"}, 401)

    return json_response({"user": user})


@app.route("/signup", methods=["POST", "OPTIONS"])
def signup():
    if request.method == "OPTIONS":
        return json_response({})

    payload = request.get_json(silent=True) or {}
    company = (payload.get("company") or "").strip()
    user_id = (payload.get("userId") or "").strip()
    name = (payload.get("name") or "").strip()
    password = payload.get("password") or ""
    confirm_password = payload.get("confirmPassword") or ""

    if not company or not user_id or not name or not password or not confirm_password:
        return json_response({"error": "All fields are required"}, 400)
    if password != confirm_password:
        return json_response({"error": "Passwords do not match"}, 400)

    try:
        user = create_employee_user(company, user_id, name, password)
    except ValueError as exc:
        status = 409 if "already exists" in str(exc) else 400
        return json_response({"error": str(exc)}, status)

    return json_response({"user": user, "message": "Account created successfully. Please login."}, 201)

@app.route("/manager-signup", methods=["POST", "OPTIONS"])
def manager_signup():
    if request.method == "OPTIONS":
        return json_response({})

    payload = request.get_json(silent=True) or {}

    company = (payload.get("company") or "").strip()
    user_id = (payload.get("userId") or "").strip()
    name = (payload.get("name") or "").strip()
    password = payload.get("password") or ""
    confirm_password = payload.get("confirmPassword") or ""
    admin_key = payload.get("adminKey") or ""

    if not company or not user_id or not name or not password or not confirm_password or not admin_key:
        return json_response({"error": "All fields are required"}, 400)

    if password != confirm_password:
        return json_response({"error": "Passwords do not match"}, 400)
    
    

    print("Received :", repr(admin_key))
    print("Expected :", repr(os.environ.get("ADMIN_REGISTRATION_KEY")))

    if admin_key != os.environ.get("ADMIN_REGISTRATION_KEY"):
        return json_response({"error": "Invalid Admin Registration Key"}, 403)
        return json_response({"error": "Invalid Admin Registration Key"}, 403)

    try:
        user = create_manager_user(company, user_id, name, password)
    except ValueError as exc:
        status = 409 if "already exists" in str(exc) else 400
        return json_response({"error": str(exc)}, status)

    return json_response(
        {
            "user": user,
            "message": "Manager account created successfully."
        },
        201,
    )


@app.route("/submit-suggestion", methods=["POST", "OPTIONS"])
def submit_suggestion():
    if request.method == "OPTIONS":
        return json_response({})

    company = request.form.get("company")
    employee_id = request.form.get("employeeId")
    employee_name = request.form.get("employeeName")
    audio = request.files.get("audio")

    if not company or not employee_id or not employee_name:
      return json_response({"error": "Employee details are required"}, 400)

    if not audio:
      return json_response({"error": "Audio recording is required"}, 400)

    suffix = os.path.splitext(audio.filename or "")[1] or ".webm"

    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_path = temp_file.name
            audio.save(temp_file)

        print("Audio saved to:", temp_path)
        processed = process_audio(temp_path)
        print("Processed:", processed)

        payload = {
            "company": company,
            "employeeId": employee_id,
            "employeeName": employee_name,
            **processed,
            "status": "Pending",
        }
        print("Payload:", payload)

        suggestion = create_suggestion(payload)

        return json_response({"suggestion": suggestion})
    except Exception as exc:
        app.logger.exception("Error processing suggestion")
        return json_response({"error": str(exc)}, 500)
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass


@app.route("/employee-suggestions/<company>/<employee_id>", methods=["GET"])
def employee_suggestions(company, employee_id):
    return json_response({
        "suggestions": list_employee_suggestions(company, employee_id)
    })


@app.route("/company-suggestions/<company>", methods=["GET"])
def company_suggestions(company):
    return json_response({
        "suggestions": list_company_suggestions(company)
    })


@app.route("/update-status/<suggestion_id>", methods=["PUT", "OPTIONS"])
def update_status(suggestion_id):
    if request.method == "OPTIONS":
        return json_response({})

    payload = request.get_json(silent=True) or {}
    try:
        suggestion = update_suggestion_status(suggestion_id, payload.get("status"))
    except ValueError as exc:
        return json_response({"error": str(exc)}, 400)

    if not suggestion:
        return json_response({"error": "Suggestion not found"}, 404)

    return json_response({"suggestion": suggestion})


@app.route("/review-suggestion/<suggestion_id>", methods=["PUT", "OPTIONS"])
def review_suggestion(suggestion_id):
    if request.method == "OPTIONS":
        return json_response({})

    payload = request.get_json(silent=True) or {}
    try:
        suggestion = update_suggestion_review(
            suggestion_id,
            payload.get("approval"),
            payload.get("status"),
            payload.get("feedback") or "",
            payload.get("rejectionReason") or "",
        )
    except ValueError as exc:
        return json_response({"error": str(exc)}, 400)

    if not suggestion:
        return json_response({"error": "Suggestion not found"}, 404)

    return json_response({"suggestion": suggestion})


@app.route("/delete-suggestion/<suggestion_id>", methods=["DELETE", "OPTIONS"])
def delete_status(suggestion_id):
    if request.method == "OPTIONS":
        return json_response({})

    if not delete_suggestion(suggestion_id):
        return json_response({"error": "Suggestion not found"}, 404)

    return json_response({"deleted": True})


@app.route("/analytics/<company>", methods=["GET"])
def analytics(company):
    return json_response({
        "analytics": build_analytics(list_company_suggestions(company))
    })


@app.route("/suggestion/<suggestion_id>", methods=["GET"])
def suggestion(suggestion_id):
    item = get_suggestion(suggestion_id)
    if not item:
        return json_response({"error": "Suggestion not found"}, 404)
    return json_response({"suggestion": item})


@app.route("/translate-display", methods=["POST", "OPTIONS"])
def translate_display():
    if request.method == "OPTIONS":
        return json_response({})

    payload = request.get_json(silent=True) or {}
    target_language = (payload.get("targetLanguage") or "en").strip().lower()
    texts = payload.get("texts") or []

    if not isinstance(texts, list):
        return json_response({"error": "texts must be a list"}, 400)

    unique_texts = []
    seen = set()
    for value in texts:
        text = str(value or "").strip()
        if not text or text == "-" or text in seen:
            continue
        seen.add(text)
        unique_texts.append(text)

    if target_language == "en":
        return json_response({"translations": {text: text for text in unique_texts}})

    translations = {}
    for text in unique_texts:
        try:
            translations[text] = translate_from_english(text, target_language)
        except Exception:
            translations[text] = text

    return json_response({"translations": translations})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
