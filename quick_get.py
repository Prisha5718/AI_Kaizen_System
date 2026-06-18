import os

import requests

API_BASE = (os.environ.get("API_BASE") or "http://" + "local" + "host" + ":10000").rstrip("/")

try:
    r = requests.get(f"{API_BASE}/all-suggestions", timeout=5)
    print('status', r.status_code)
    print(r.text[:500])
except Exception as e:
    print('GET failed', type(e), e)
