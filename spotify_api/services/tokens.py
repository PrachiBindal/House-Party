from django.utils import timezone
from datetime import timedelta
from ..models import SpotifyToken
from ..credentials import CLIENT_ID, CLIENT_SECRET
from requests import post


def get_user_tokens(session_id):
    return SpotifyToken.objects.filter(user=session_id).first()


def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    if expires_in is None:
        expires_in = 3600
    expires_at = timezone.now() + timedelta(seconds=expires_in)
    tokens = get_user_tokens(session_id)
    if tokens:
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expires_at
        tokens.token_type = token_type
        tokens.save(update_fields=["access_token", "refresh_token", "expires_in", "token_type"])
    else:
        SpotifyToken.objects.create(
            user=session_id,
            access_token=access_token,
            refresh_token=refresh_token,
            token_type=token_type,
            expires_in=expires_at,
        )


def refresh_spotify_token(session_id):
    tokens = get_user_tokens(session_id)
    if not tokens:
        return None
    refresh_token = tokens.refresh_token
    response = post(
        'https://accounts.spotify.com/api/token',
        data={
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token,
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
        },
    ).json()
    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    if access_token and token_type and expires_in:
        update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token)
    return response


def is_spotify_authenticated(session_id):
    tokens = get_user_tokens(session_id)
    if not tokens:
        return False
    if tokens.expires_in <= timezone.now():
        refresh_spotify_token(session_id)
    return True
