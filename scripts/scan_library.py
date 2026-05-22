import sqlite3
from pathlib import Path

from mutagen.mp3 import MP3
from mutagen.easyid3 import EasyID3

BASE_DIR = Path.home() / "OpenWave"

DOWNLOAD_DIR = BASE_DIR / "downloads"

DB_PATH = BASE_DIR / "database" / "openwave.db"

conn = sqlite3.connect(DB_PATH)

cursor = conn.cursor()

for file in DOWNLOAD_DIR.glob("*.mp3"):

    try:

        audio = MP3(file)

        tags = EasyID3(file)

        title = tags.get("title", ["Unknown"])[0]

        artist = tags.get("artist", ["Unknown"])[0]

        album = tags.get("album", ["Unknown"])[0]

        duration = round(audio.info.length, 2)

        cursor.execute("""
        INSERT OR IGNORE INTO tracks
        (
            title,
            artist,
            album,
            duration,
            filepath
        )
        VALUES (?, ?, ?, ?, ?)
        """, (
            title,
            artist,
            album,
            duration,
            str(file)
        ))

        print(f"Indexed: {title}")

    except Exception as e:

        print(f"Error with {file.name}: {e}")

conn.commit()

conn.close()

print("Library scan complete.")

