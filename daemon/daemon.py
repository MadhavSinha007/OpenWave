import os
import time
import subprocess

COMMAND_FILE = "daemon/command.txt"

STATE_FILE = "daemon/state.txt"

CURRENT_PROCESS = None


def set_state(state):

    with open(STATE_FILE, "w") as file:

        file.write(state)


def play_song(song):

    global CURRENT_PROCESS

    if CURRENT_PROCESS:

        CURRENT_PROCESS.terminate()

    CURRENT_PROCESS = subprocess.Popen(

        ["mpv", "--no-video", song]

    )

    set_state(f"PLAYING:{song}")


set_state("IDLE")

print("OpenWave Daemon Running...")


while True:

    if os.path.exists(COMMAND_FILE):

        with open(COMMAND_FILE, "r") as file:

            command = file.read().strip()

        os.remove(COMMAND_FILE)

        if command.startswith("PLAY:"):

            song = command.replace("PLAY:", "", 1)

            print(f"Playing: {song}")

            play_song(song)

        elif command == "STOP":

            if CURRENT_PROCESS:

                CURRENT_PROCESS.terminate()

                CURRENT_PROCESS = None

                set_state("STOPPED")

        elif command == "PAUSE":

            if CURRENT_PROCESS:

                CURRENT_PROCESS.send_signal(subprocess.signal.SIGSTOP)

                set_state("PAUSED")

        elif command == "RESUME":

            if CURRENT_PROCESS:

                CURRENT_PROCESS.send_signal(subprocess.signal.SIGCONT)

                set_state("PLAYING")

    time.sleep(1)
