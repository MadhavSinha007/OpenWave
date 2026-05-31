import os
import sqlite3

from mutagen.mp3 import MP3
from mutagen.id3 import APIC

DB = "database/openwave.db"

COVER_DIR = "covers"

os.makedirs(COVER_DIR, exist_ok=True)

connection = sqlite3.connect(DB)
cursor = connection.cursor()

cursor.execute("""
SELECT id, filepath
FROM tracks
""")

tracks = cursor.fetchall()

for track_id, filepath in tracks:

    try:

        audio = MP3(filepath)

        found = False

        for tag in audio.tags.values():

            if isinstance(tag, APIC):

                cover_file = f"{COVER_DIR}/{track_id}.jpg"

                with open(cover_file, "wb") as image:

                    image.write(tag.data)

                cursor.execute("""
                UPDATE tracks
                SET cover_path = ?
                WHERE id = ?
                """, (cover_file, track_id))

                connection.commit()

                print("Extracted:", cover_file)

                found = True

                break

        if not found:

            print("No artwork:", filepath)

    except Exception as error:

        print("Failed:", filepath)
        print(error)

connection.close()

print("Done.")