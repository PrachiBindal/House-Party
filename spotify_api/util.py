"""Backward-compatible facade re-exporting service-layer Spotify helpers.

This file kept intentionally thin so existing imports like:
    from spotify_api.util import play_song
continue to work after refactor to a services package.
"""

from .services import (
    get_user_tokens,
    update_or_create_user_tokens,
    refresh_spotify_token,
    is_spotify_authenticated,
    execute_spotify_api_request,
    play_song,
    pause_song,
    skip_song,
    play_track_at_position,
)

__all__ = [
    "get_user_tokens",
    "update_or_create_user_tokens",
    "refresh_spotify_token",
    "is_spotify_authenticated",
    "execute_spotify_api_request",
    "play_song",
    "pause_song",
    "skip_song",
    "play_track_at_position",
]