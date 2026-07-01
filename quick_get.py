import os

import requests

API_BASE = (os.environ.get("API_BASE") or "http://127.0.0.1:8080").rstrip("/")
COMPANY = os.environ.get("COMPANY", "IFQM")

try:
    r = requests.get(f"{API_BASE}/company-suggestions/{COMPANY}", timeout=5)
    print('status', r.status_code)
    print(r.text[:500])
except Exception as e:
    print('GET failed', type(e), e)
