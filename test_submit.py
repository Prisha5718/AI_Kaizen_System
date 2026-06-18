import os

import requests

API_BASE = (os.environ.get("API_BASE") or "http://" + "local" + "host" + ":10000").rstrip("/")
API = f"{API_BASE}/submit-suggestion"

def submit_test(audio_path, employee_id="EMP001", employee_name="Test User"):
    with open(audio_path, "rb") as f:
        files = {"audio": (audio_path, f, "audio/wav")}
        data = {"employeeId": employee_id, "employeeName": employee_name}
        r = requests.post(API, data=data, files=files)
        try:
            print(r.status_code, r.json())
        except Exception:
            print(r.status_code, r.text)

if __name__ == '__main__':
    submit_test("audio/test.wav")
