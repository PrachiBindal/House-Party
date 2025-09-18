# Spotify API Module Architecture

This package has been refactored to introduce a light service layer while preserving backwards compatibility for existing imports.

## Goals
- Clear separation of concerns (tokens, low-level HTTP client, playback helpers)
- Easier unit testing (smaller modules)
- Backwards compatibility via `util.py` re-export facade
- Explicit public surface via `services/__init__.py`

## Layout
- `services/constants.py` – Static constants (e.g. API base URL)
- `services/tokens.py` – Token CRUD, refresh, authentication helpers
- `services/client.py` – Generic Spotify API request execution
- `services/playback.py` – High-level playback control helpers
- `services/__init__.py` – Aggregated export list
- `util.py` – Backwards-compatible facade re-exporting the above symbols

## Migration
Existing code that does:
```python
from spotify_api.util import play_song
```
continues to work. New code may prefer:
```python
from spotify_api.services import play_song
```

## Future Extension Ideas
- Add `devices.py` for device listing / transfer
- Introduce `sync.py` encapsulating playback synchronization logic
- Add structured error types instead of raw dicts
- Provide typed interfaces (e.g. using `dataclasses`) for responses

## Testing Guidance
- Mock `requests` in `client.py`
- Test token expiry + refresh path in `tokens.py`
- Playback helpers: assert correct endpoint & method delegation

