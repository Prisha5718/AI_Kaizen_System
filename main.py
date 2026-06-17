import os
import tempfile
from datetime import datetime, timezone

from flask import Flask, jsonify, request

DEBUG_LOG_PATH = "debug_requests.log"

def file_debug(msg):
    with open(DEBUG_LOG_PATH, "a", encoding="utf-8") as f:
        f.write(msg + "\n")

from analytics import build_analytics
from authentication import login_user
from firebase_ops import (
    create_employee_user,
    create_suggestion,
    delete_suggestion,
    get_suggestion,
    list_employee_suggestions,
    list_suggestions,
    update_suggestion_status,
)
from speech_processing import process_audio


app = Flask(__name__, static_folder="frontend", static_url_path="")


def json_response(payload, status=200):
    response = jsonify(payload)
    response.status_code = status
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return json_response({})

    payload = request.get_json(silent=True) or {}
    user = login_user(payload.get("userId"), payload.get("password"))
    if not user:
        return json_response({"error": "Invalid user ID or password"}, 401)

    return json_response({"user": user})


@app.route("/signup", methods=["POST", "OPTIONS"])
def signup():
    if request.method == "OPTIONS":
        return json_response({})

    payload = request.get_json(silent=True) or {}
    user_id = (payload.get("userId") or "").strip()
    name = (payload.get("name") or "").strip()
    password = payload.get("password") or ""
    confirm_password = payload.get("confirmPassword") or ""

    if not user_id or not name or not password or not confirm_password:
        return json_response({"error": "All fields are required"}, 400)
    if password != confirm_password:
        return json_response({"error": "Passwords do not match"}, 400)

    try:
        user = create_employee_user(user_id, name, password)
    except ValueError as exc:
        status = 409 if str(exc) == "Employee ID already exists" else 400
        return json_response({"error": str(exc)}, status)

    return json_response({"user": user, "message": "Account created successfully. Please login."}, 201)


@app.route("/submit-suggestion", methods=["POST", "OPTIONS"])
def submit_suggestion():
    if request.method == "OPTIONS":
        return json_response({})

    employee_id = request.form.get("employeeId")
    employee_name = request.form.get("employeeName")
    audio = request.files.get("audio")

    file_debug(f'DEBUG: submit_suggestion called; form keys={list(request.form.keys())}; files={list(request.files.keys())}')
    print('DEBUG: submit_suggestion called; form keys=', list(request.form.keys()), 'files=', list(request.files.keys()), flush=True)

    if not employee_id or not employee_name:
        return json_response({"error": "Employee details are required"}, 400)
    if not audio:
        return json_response({"error": "Audio recording is required"}, 400)

    skip_transcribe = os.environ.get("SKIP_TRANSCRIBE") == "1"
    suffix = os.path.splitext(audio.filename or "")[1] or ".webm"
    temp_path = None

    try:
        if skip_transcribe:
            file_debug('DEBUG: SKIP_TRANSCRIBE=1, creating test suggestion and saving to Firestore')
            print('DEBUG: SKIP_TRANSCRIBE=1,creating test suggestion and saving to Firestore', flush=True)
            processed = {
                "originalText": "Test suggestion from audio",
                "translatedText": "Test suggestion from audio",
                "language": "English",
                "category": "General Improvement",
                "priority": "Low",
            }
            suggestion = create_suggestion(
                {
                    "employee_id": employee_id,
                    "employeeName": employee_name,
                    **processed,
                    "status": "Pending",
                }
            )
        else:
            file_debug('DEBUG: saving uploaded audio to temp file')
            print('DEBUG: saving uploaded audio to temp file', flush=True)
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                temp_path = temp_file.name
                audio.save(temp_file)
            file_debug(f'DEBUG: saved audio to {temp_path}')
            print('DEBUG: saved audio to', temp_path, flush=True)

            file_debug('DEBUG: calling process_audio')
            print('DEBUG: calling process_audio', flush=True)
            processed = process_audio(temp_path)
            file_debug('DEBUG: process_audio returned')
            print('DEBUG: process_audio returned', flush=True)

            suggestion = create_suggestion(
                {
                    "employeeId": employee_id,
                    "employeeName": employee_name,
                    **processed,
                    "status": "Pending",
                }
            )

        return json_response({"suggestion": suggestion})
    except Exception as exc:
        import traceback

        error_text = traceback.format_exc()

        print("========== ERROR ==========")
        print(error_text)
        print("===========================")

        return json_response(
            {
                "error": str(exc),
                "traceback": error_text
        },
        500
        )


@app.route("/employee-suggestions/<employee_id>", methods=["GET"])
def employee_suggestions(employee_id):
    return json_response({"suggestions": list_employee_suggestions(employee_id)})


@app.route("/all-suggestions", methods=["GET"])
def all_suggestions():
    return json_response({"suggestions": list_suggestions()})


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


@app.route("/delete-suggestion/<suggestion_id>", methods=["DELETE", "OPTIONS"])
def delete_status(suggestion_id):
    if request.method == "OPTIONS":
        return json_response({})

    if not delete_suggestion(suggestion_id):
        return json_response({"error": "Suggestion not found"}, 404)

    return json_response({"deleted": True})


@app.route("/analytics", methods=["GET"])
def analytics():
    return json_response({"analytics": build_analytics(list_suggestions())})


@app.route("/suggestion/<suggestion_id>", methods=["GET"])
def suggestion(suggestion_id):
    item = get_suggestion(suggestion_id)
    if not item:
        return json_response({"error": "Suggestion not found"}, 404)
    return json_response({"suggestion": item})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
