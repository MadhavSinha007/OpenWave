from fastapi import FastAPI
from fastapi import WebSocket
from fastapi import WebSocketDisconnect

from fastapi.middleware.cors import CORSMiddleware

import sqlite3
import os
import asyncio
import json

from pathlib import Path

app = FastAPI()

# =========================================
# CORS
# =========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
# =========================================
# BASE PATHS
# =========================================

BASE_DIR = Path(__file__).resolve().parent.parent

DB_PATH = BASE_DIR / "database" / "openwave.db"

DAEMON_DIR = BASE_DIR / "daemon"

COMMAND_FILE = DAEMON_DIR / "command.txt"

LIVE_STATE_FILE = DAEMON_DIR / "live_state.json"

# =========================================
# HELPERS
# =========================================

def get_connection():

    return sqlite3.connect(DB_PATH)

# =========================================
# ROOT
# =========================================

@app.get("/")
def home():

    return {

        "name": "OpenWave API",

        "status": "running"

    }

# =========================================
# SONGS
# =========================================

@app.get("/songs")
def get_songs():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""

    SELECT id,
           title,
           artist

    FROM tracks

    ORDER BY id DESC

    """)

    songs = cursor.fetchall()

    connection.close()

    results = []

    for song in songs:

        results.append({

            "id": song[0],

            "title": song[1],

            "artist": song[2]

        })

    return results

# =========================================
# PLAYLISTS
# =========================================

@app.get("/playlists")
def get_playlists():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""

    SELECT id,
           name

    FROM playlists

    """)

    playlists = cursor.fetchall()

    connection.close()

    results = []

    for playlist in playlists:

        results.append({

            "id": playlist[0],

            "name": playlist[1]

        })

    return results

# =========================================
# PLAY SONG
# =========================================

@app.post("/play/{track_id}")
def play_song(track_id: int):

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""

    SELECT filepath

    FROM tracks

    WHERE id = ?

    """, (track_id,))

    song = cursor.fetchone()

    connection.close()

    if not song:

        return {

            "error": "Song not found"

        }

    filepath = song[0]

    os.makedirs(DAEMON_DIR, exist_ok=True)

    with open(COMMAND_FILE, "w") as file:

        file.write(f"PLAY:{filepath}")

    return {

        "status": "playing",

        "song": filepath

    }

# =========================================
# PAUSE
# =========================================

@app.post("/pause")
def pause_song():

    os.makedirs(DAEMON_DIR, exist_ok=True)

    with open(COMMAND_FILE, "w") as file:

        file.write("PAUSE")

    return {

        "status": "paused"

    }

# =========================================
# RESUME
# =========================================

@app.post("/resume")
def resume_song():

    os.makedirs(DAEMON_DIR, exist_ok=True)

    with open(COMMAND_FILE, "w") as file:

        file.write("RESUME")

    return {

        "status": "resumed"

    }

# =========================================
# STOP
# =========================================

@app.post("/stop")
def stop_song():

    os.makedirs(DAEMON_DIR, exist_ok=True)

    with open(COMMAND_FILE, "w") as file:

        file.write("STOP")

    return {

        "status": "stopped"

    }

# =========================================
# RECOMMENDATIONS
# =========================================

@app.get("/recommend/mostplayed")
def most_played():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""

    SELECT tracks.title,
           tracks.artist,
           COUNT(listening_history.track_id) AS plays

    FROM listening_history

    JOIN tracks

    ON tracks.id = listening_history.track_id

    GROUP BY listening_history.track_id

    ORDER BY plays DESC

    LIMIT 10

    """)

    rows = cursor.fetchall()

    connection.close()

    results = []

    for row in rows:

        results.append({

            "title": row[0],

            "artist": row[1],

            "plays": row[2]

        })

    return results

# =========================================
# WEBSOCKET
# =========================================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):

    await websocket.accept()

    print("Frontend connected")

    try:

        while True:

            if LIVE_STATE_FILE.exists():

                try:

                    with open(LIVE_STATE_FILE, "r") as file:

                        data = json.load(file)

                except json.JSONDecodeError:

                    data = {

                        "status": "ERROR",

                        "message": "Invalid live state"

                    }

            else:

                data = {

                    "status": "IDLE",

                    "song": ""

                }

            await websocket.send_json(data)

            await asyncio.sleep(1)

    except WebSocketDisconnect:

        print("Frontend disconnected")

    except Exception as e:

        print(f"WebSocket error: {e}")
