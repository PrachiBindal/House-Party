import json
from requests import get, post, put
from .constants import BASE_URL
from .tokens import get_user_tokens


def execute_spotify_api_request(session_id, endpoint, method="GET", body=None):
    tokens = get_user_tokens(session_id)
    if not tokens:
        return {"error": "No tokens"}

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {tokens.access_token}",
    }
    url = BASE_URL + endpoint

    method = method.upper()
    if method == "POST":
        r = post(url, headers=headers, data=json.dumps(body) if body else None)
    elif method == "PUT":
        r = put(url, headers=headers, data=json.dumps(body) if body else None)
    else:
        r = get(url, headers=headers)

    if method in ("POST", "PUT"):
        try:
            return r.json() if r.content else {"status": r.status_code}
        except Exception:
            return {"status": r.status_code}

    try:
        return r.json()
    except Exception:
        return {"error": "Issue with request"}
