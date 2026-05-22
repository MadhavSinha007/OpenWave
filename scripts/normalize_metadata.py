import sqlite3
import re

DB = "database/openwave.db"

connection = sqlite3.connect(DB)

cursor = connection.cursor()

cursor.execute("""

SELECT id, title, artist
FROM tracks

""")

tracks = cursor.fetchall()


def clean_title(title):

    title = title.replace("_", " ")

    patterns = [

        r"\(Official.*?\)",
        r"\[Official.*?\]",
        r"Official Video",
        r"Official Audio",
        r"Official",
        r"Lyrics",
        r"Lyric Video",
        r"HD",
        r"4K",
        r"Extra Extended",
        r"Soundtrack",
        r"Audio",
        r"Video"
    ]

    for pattern in patterns:

        title = re.sub(pattern, "", title, flags=re.IGNORECASE)

    title = re.sub(r"\s+", " ", title)

    return title.strip(" -")


def extract_artist(title, current_artist):

    match = re.search(r"by (.+)", title, re.IGNORECASE)

    if match:

        return match.group(1).strip()

    return current_artist


for track in tracks:

    track_id = track[0]

    old_title = track[1]

    old_artist = track[2]

    cleaned_title = clean_title(old_title)

    cleaned_artist = extract_artist(old_title, old_artist)

    cursor.execute("""

    UPDATE tracks

    SET title = ?,
        artist = ?

    WHERE id = ?

    """, (cleaned_title, cleaned_artist, track_id))

    print(f"Updated: {cleaned_title} -> {cleaned_artist}")

connection.commit()

connection.close()

print("")
print("Metadata normalization complete.")
print("")
