from fastapi import FastAPI
from fastapi import WebSocket
from fastapi import WebSocketDisconnect

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import sqlite3
import os
import asyncio
import json

from pathlib import Path

app = FastAPI()

# =========================================
# STATIC FILES (COVERS)
# =========================================

app.mount(
    "/covers",
    StaticFiles(directory="covers"),
    name="covers"
)

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
# PATHS
# =========================================

BASE_DIR = Path(__file__).resolve().parent.parent

DB_PATH = BASE_DIR / "database" / "openwave.db"

DAEMON_DIR = BASE_DIR / "daemon"

COMMAND_FILE = DAEMON_DIR / "command.txt"

LIVE_STATE_FILE = DAEMON_DIR / "live_state.json"

# =========================================
# DATABASE
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
           artist,
           cover_path

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

            "artist": song[2],
            
            "cover": song[3]

        })

    return results

# =========================================
# PLAY
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

    with open(COMMAND_FILE, "w") as file:

        file.write(f"PLAY:{filepath}")

    return {

        "status": "playing"

    }

# =========================================
# PAUSE
# =========================================

@app.post("/pause")
def pause_song():

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

    with open(COMMAND_FILE, "w") as file:

        file.write("STOP")

    return {

        "status": "stopped"

    }

# =========================================
# SEEK
# =========================================

@app.post("/seek/{seconds}")
def seek_track(seconds: int):

    with open(COMMAND_FILE, "w") as file:

        file.write(f"SEEK:{seconds}")

    return {

        "status": "seeking",

        "seconds": seconds

    }

# =========================================
# VOLUME
# =========================================

@app.post("/volume/{level}")
def volume(level: int):

    with open(COMMAND_FILE, "w") as file:

        file.write(f"VOLUME:{level}")

    return {

        "status": "volume changed",

        "volume": level

    }

# =========================================
# WEBSOCKET
# =========================================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):

    await websocket.accept()

    try:

        while True:

            if LIVE_STATE_FILE.exists():

                with open(LIVE_STATE_FILE, "r") as file:

                    data = json.load(file)

            else:

                data = {

                    "status": "IDLE"

                }

            await websocket.send_json(data)

            await asyncio.sleep(1)

    except WebSocketDisconnect:

        print("Frontend disconnected")