import sqlite3
from pathlib import Path

BASE_DIR = Path.home() / "OpenWave"
DB_PATH = BASE_DIR / "database" / "openwave.db"

conn = sqlite3.connect(DB_PATH)

cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    artist TEXT,
    album TEXT,
    duration REAL,
    filepath TEXT UNIQUE
)
""")

conn.commit()
conn.close()

print("Database initialized.")
