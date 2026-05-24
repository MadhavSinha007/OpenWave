# OpenWave Documentation — Phases 1 to 10

## Project Overview

OpenWave is a Spotify-like music platform built step-by-step using:
- Bash
- Python
- SQLite
- FastAPI
- MPV
- Textual

Current features:
- YouTube downloader
- MP3 conversion
- Metadata embedding
- Music library
- Queue system
- Playlist engine
- Recommendation engine
- Playback daemon
- Terminal UI
- REST API backend

---

# Folder Structure

```text
OpenWave/
│
├── api/
│   └── server.py
│
├── daemon/
│   ├── daemon.py
│   ├── command.txt
│   └── state.txt
│
├── database/
│   └── openwave.db
│
├── downloads/
│
├── player/
│
├── scripts/
│
├── src/
│   └── ow
│
└── ui/
    └── tui.py
```

---

# Required Dependencies

## System Packages

```bash
sudo apt update
sudo apt install sqlite3 ffmpeg mpv python3-pip
```

## Python Packages

```bash
pip install yt-dlp
pip install textual
pip install fastapi uvicorn
pip install mutagen pillow rich rich-pixels
```

---

# Phase 1 — Downloader Engine

## Commands

### Download via URL

```bash
./src/ow download "YOUTUBE_URL"
```

### Search and Download

```bash
./src/ow search "song name"
```

---

# Phase 2 — Music Library System

## Commands

### Scan Library

```bash
./src/ow library scan
```

### List Songs

```bash
./src/ow library list
```

### Search Songs

```bash
./src/ow library search "song"
```

---

# Phase 3 — Playback Engine

## Commands

### Play Song

```bash
./src/ow play
```

### Pause Playback

```bash
./src/ow pause
```

### Resume Playback

```bash
./src/ow resume
```

### Stop Playback

```bash
./src/ow stop
```

---

# Phase 4 — Queue + Playlist System

## Commands

### Add Song to Queue

```bash
./src/ow queue add "song name"
```

### Play Queue

```bash
./src/ow queue play
```

### Create Playlist

```bash
./src/ow playlist create chill
```

### Add Song to Playlist

```bash
./src/ow playlist add chill "interstellar"
```

### Show Playlist

```bash
./src/ow playlist show chill
```

### Play Playlist

```bash
./src/ow playlist play chill
```

### List Playlists

```bash
./src/ow playlist list
```

---

# Phase 5 — Playlist Architecture Expansion

Additional playlist architecture and queue persistence improvements.

---

# Phase 6 — Metadata Normalization

## Commands

### Normalize Metadata

```bash
./src/ow library normalize
```

---

# Phase 7 — Recommendation Engine

## Commands

### Most Played Songs

```bash
./src/ow recommend mostplayed
```

### Recently Played

```bash
./src/ow recommend recent
```

### Recommend by Artist

```bash
./src/ow recommend artist "Hans Zimmer"
```

---

# Phase 8 — Playback Daemon

## Start Daemon

```bash
python3 daemon/daemon.py
```

## Daemon Commands

### Play Song

```bash
echo "PLAY:downloads/song.mp3" > daemon/command.txt
```

### Pause

```bash
echo "PAUSE" > daemon/command.txt
```

### Resume

```bash
echo "RESUME" > daemon/command.txt
```

### Stop

```bash
echo "STOP" > daemon/command.txt
```

### Read Current State

```bash
cat daemon/state.txt
```

---

# Phase 9 — Terminal User Interface (TUI)

## Start TUI

```bash
python3 ui/tui.py
```

## Keyboard Controls

| Key | Action |
|---|---|
| P | Pause |
| R | Resume |
| S | Stop |

---

# Phase 10 — REST API Backend

## Start API Server

```bash
uvicorn api.server:app --reload
```

## Swagger API Docs

Open:

```text
http://127.0.0.1:8000/docs
```

---

# API Endpoints

## Home

```http
GET /
```

## Songs

```http
GET /songs
```

## Playlists

```http
GET /playlists
```

## Play Song

```http
POST /play/{track_id}
```

Example:

```http
POST /play/1
```

## Pause

```http
POST /pause
```

## Resume

```http
POST /resume
```

## Stop

```http
POST /stop
```

## Recommendations

```http
GET /recommend/mostplayed
```

---

# Database Commands

## Open Database

```bash
sqlite3 database/openwave.db
```

## Show Tables

```sql
.tables
```

## View Tracks

```sql
SELECT * FROM tracks;
```

## View Playlists

```sql
SELECT * FROM playlists;
```

## View Playlist Tracks

```sql
SELECT * FROM playlist_tracks;
```

## View Listening History

```sql
SELECT * FROM listening_history;
```

## Exit SQLite

```sql
.quit
```

---

# Full Startup Flow

## Terminal 1

```bash
python3 daemon/daemon.py
```

## Terminal 2

```bash
uvicorn api.server:app --reload
```

## Terminal 3

```bash
python3 ui/tui.py
```

## Terminal 4

```bash
./src/ow play
```

---

# Current OpenWave Features

- Downloader engine
- MP3 conversion
- Metadata embedding
- SQLite music database
- Queue system
- Playlist engine
- Recommendation engine
- Playback daemon
- Interactive TUI
- REST API backend

---

# Next Phase

Phase 11:
Desktop GUI Application using:
- React
- Tauri
- REST API integration