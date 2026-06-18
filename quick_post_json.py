import os

import requests

API_BASE = (os.environ.get("API_BASE") or "http://" + "local" + "host" + ":10000").rstrip("/")

try:
    r = requests.post(f"{API_BASE}/login", json={'userId':'EMP001','password':'123456'}, timeout=5)
    print('status', r.status_code)
    print(r.text)
except Exception as e:
    print('POST failed', type(e), e)
