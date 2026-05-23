from textual.app import App
from textual.widgets import Header
from textual.widgets import Footer
from textual.widgets import Static
from textual.widgets import DataTable

import sqlite3
import os


DB = "database/openwave.db"

STATE_FILE = "daemon/state.txt"


class OpenWave(App):

    CSS = """

    Screen {

        background: black;
        color: white;
    }

    """

    def compose(self):

        yield Header()

        yield Static(
            "OpenWave Music System",
            id="title"
        )

        yield DataTable(id="songs")

        yield Static(
            "",
            id="player_status"
        )

        yield Footer()

    def on_mount(self):

        table = self.query_one("#songs", DataTable)

        table.add_columns(

            "ID",
            "Title",
            "Artist"

        )

        connection = sqlite3.connect(DB)

        cursor = connection.cursor()

        cursor.execute("""

        SELECT id, title, artist
        FROM tracks

        ORDER BY id DESC

        LIMIT 20

        """)

        songs = cursor.fetchall()

        for song in songs:

            table.add_row(

                str(song[0]),
                song[1],
                song[2]

            )

        connection.close()

        self.set_interval(

            1,
            self.update_status

        )

    def update_status(self):

        status_widget = self.query_one(

            "#player_status",
            Static

        )

        if os.path.exists(STATE_FILE):

            with open(STATE_FILE, "r") as file:

                state = file.read()

        else:

            state = "IDLE"

        status_widget.update(

            f"Player Status: {state}"

        )

    def on_key(self, event):

        key = event.key

        if key == "p":

            with open(
                "daemon/command.txt",
                "w"
            ) as file:

                file.write("PAUSE")

        elif key == "r":

            with open(
                "daemon/command.txt",
                "w"
            ) as file:

                file.write("RESUME")

        elif key == "s":

            with open(
                "daemon/command.txt",
                "w"
            ) as file:

                file.write("STOP")


app = OpenWave()

app.run()