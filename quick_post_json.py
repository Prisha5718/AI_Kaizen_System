import requests

try:
    r = requests.post('http://127.0.0.1:5000/login', json={'userId':'EMP001','password':'123456'}, timeout=5)
    print('status', r.status_code)
    print(r.text)
except Exception as e:
    print('POST failed', type(e), e)
