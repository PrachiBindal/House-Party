from .client import execute_spotify_api_request


def play_song(session_id):
    return execute_spotify_api_request(session_id, "player/play", method="PUT")


def pause_song(session_id):
    return execute_spotify_api_request(session_id, "player/pause", method="PUT")


def skip_song(session_id):
    return execute_spotify_api_request(session_id, "player/next", method="POST")


def play_track_at_position(session_id, track_uri, position_ms=0):
    body = {"uris": [track_uri], "position_ms": max(0, int(position_ms or 0))}
    return execute_spotify_api_request(session_id, "player/play", method="PUT", body=body)
