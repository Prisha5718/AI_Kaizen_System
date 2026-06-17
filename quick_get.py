import requests

try:
    r = requests.get('http://127.0.0.1:5000/all-suggestions', timeout=5)
    print('status', r.status_code)
    print(r.text[:500])
except Exception as e:
    print('GET failed', type(e), e)
