# Music Controller (Django + React + Spotify)

A multi-user room-based music controller. The host authenticates with Spotify and controls playback; guests see the same track and auto-synchronize (track, position, play/pause). Supports play/pause, skip with votes, and basic room management.

## What it does
- Create or join a room via the web UI
- Host authenticates with Spotify (Authorization Code Flow)
- Display current song (title, artists, album art, progress)
- Control playback (play/pause, skip with votes)
- Auto-sync guests to the host’s current track and position

## Tech stack and versions
Backend:
- Python 3.12+ (tested locally)
- Django 5.2.5
- Django REST Framework (APIView style)
- requests (Spotify Web API)
- django-sslserver (for local HTTPS callback)

Frontend:
- React ^19.1.1
- React DOM ^19.1.1
- React Router DOM ^7.8.1
- Material UI (MUI) ^7.3.1 + emotion
- Webpack ^5.101.3, webpack-cli ^6.0.1
- Babel: @babel/core ^7.28.3, preset-env ^7.28.3, preset-react ^7.27.1, babel-loader ^10.0.0

Notes:
- Database: SQLite (default `db.sqlite3`)
- Spotify account: Premium recommended for playback control; an active device is required

## Folder structure (key parts)
```
projects/music_controller/
├─ manage.py
├─ db.sqlite3                 # local dev DB (ignored if you prefer)
├─ music_controller/          # Django project settings/urls
│  ├─ settings.py
│  └─ urls.py
├─ api/                       # Rooms app (create/join, votes_to_skip, guest_can_pause)
│  ├─ models.py               # Room model
│  ├─ views.py, urls.py
│  └─ serializers.py
├─ spotify_api/               # Spotify integration
│  ├─ models.py               # SpotifyToken, Vote
│  ├─ urls.py
|  ├─ views.py                # Auth, current-song, play/pause/skip, sync
│  ├─ util.py                 # Facade re-export (backward-compat)
│  ├─ services/               # New service layer (organized helpers)
│  │  ├─ tokens.py            # token CRUD/refresh/auth
│  │  ├─ client.py            # low-level HTTP to Spotify
│  │  ├─ playback.py          # play/pause/skip helpers
│  │  └─ constants.py
│  └─ ARCHITECTURE.md
├─ frontend/                  # React app bundled by webpack
│  ├─ src/
│  │  ├─ index.js
│  │  └─ components/
│  │     ├─ app.js
│  │     ├─ homePage.js
│  │     ├─ RoomJoinPage.js
│  │     ├─ createRoomPage.js
│  │     ├─ room.js
│  │     └─ MusicPlayer.js
│  ├─ templates/frontend/index.html
│  ├─ static/frontend/        # built bundle (main.js)
│  ├─ package.json
│  └─ webpack.config.js
└─ ...
```

## Requirements to run locally
- Windows, macOS, or Linux
- Python 3.12+
- Node.js 18+ (LTS) and npm
- A Spotify application (client id/secret) in the Developer Dashboard
- Spotify account with an active device (desktop/mobile/web player)

## Setup and run (development)
1) Create and activate a Python virtual environment
- On Windows PowerShell:
```
py -m venv venv
venv\Scripts\Activate.ps1
```

2) Install Python packages
Install from the provided `requirements.txt`:
```
pip install -r requirements.txt
```

3) Configure Spotify credentials

```
create `.env` and set:
```
CLIENT_ID = "your_spotify_client_id"
CLIENT_SECRET = "your_spotify_client_secret"
REDIRECT_URI = "your_spotify_redirect_URI"
```

- In `music_controller/settings.py` the redirect is:
```
SPOTIFY_REDIRECT_URI = "https://localhost:8000/spotify/redirect"
```
Update your Spotify app settings to add this redirect URI.

4) Run database migrations
```
python manage.py migrate
```

5) Build and watch the frontend
```
cd frontend
npm install
npm run build
```
This produces `static/frontend/main.js` (served by Django template).

6) Run Django with HTTPS locally (required for Spotify redirect in this setup)
From the project root (`projects/music_controller`):
```
python manage.py runserver
```
Visit https://localhost:8000

7) Use the app
- Create a room, or join one
- As host, click “Connect Spotify” to authorize
- Start playback on your Spotify device; guests will auto-sync when they join

## Common issues
- 404 "NO_ACTIVE_DEVICE": Open Spotify on any device and start playback once
- Empty current-song: No active playback on the host account
- Play/Pause returns 403: Spotify plan limitations or missing scope (no premium)

