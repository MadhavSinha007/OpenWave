from fastapi import FastAPI
import sqlite3
import os

app = FastAPI()

DB = "database/openwave.db"


@app.get("/")
def home():

    return {

        "name": "OpenWave API",

        "status": "running"
    }


@app.get("/songs")
def get_songs():

    connection = sqlite3.connect(DB)

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


@app.get("/playlists")
def get_playlists():

    connection = sqlite3.connect(DB)

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


@app.post("/play/{track_id}")
def play_song(track_id: int):

    connection = sqlite3.connect(DB)

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

    with open(

        "daemon/command.txt",
        "w"

    ) as file:

        file.write(

            f"PLAY:{filepath}"

        )

    return {

        "status": "playing",

        "song": filepath
    }


@app.post("/pause")
def pause_song():

    with open(

        "daemon/command.txt",
        "w"

    ) as file:

        file.write("PAUSE")

    return {

        "status": "paused"
    }


@app.post("/resume")
def resume_song():

    with open(

        "daemon/command.txt",
        "w"

    ) as file:

        file.write("RESUME")

    return {

        "status": "resumed"
    }


@app.post("/stop")
def stop_song():

    with open(

        "daemon/command.txt",
        "w"

    ) as file:

        file.write("STOP")

    return {

        "status": "stopped"
    }


@app.get("/recommend/mostplayed")
def most_played():

    connection = sqlite3.connect(DB)

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
