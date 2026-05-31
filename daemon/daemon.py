import os
import time
import json
import socket
import subprocess

SOCKET_PATH = "daemon/socket/openwave.sock"

COMMAND_FILE = "daemon/command.txt"

LIVE_STATE_FILE = "daemon/live_state.json"

current_song = ""

current_volume = 80

mpv_process = None


# =========================================
# CREATE REQUIRED FOLDERS
# =========================================

os.makedirs("daemon", exist_ok=True)
os.makedirs("daemon/socket", exist_ok=True)


# =========================================
# CLEAN OLD SOCKET
# =========================================

if os.path.exists(SOCKET_PATH):

    os.remove(SOCKET_PATH)


# =========================================
# SEND IPC COMMAND
# =========================================

def send_mpv_command(command):

    if not os.path.exists(SOCKET_PATH):

        return None

    try:

        client = socket.socket(
            socket.AF_UNIX,
            socket.SOCK_STREAM
        )

        client.connect(SOCKET_PATH)

        client.send(
            (json.dumps(command) + "\n").encode()
        )

        response = client.recv(4096)

        client.close()

        return response.decode()

    except Exception as error:

        print("MPV IPC Error:", error)

        return None


# =========================================
# GET CURRENT POSITION
# =========================================

def get_playback_time():

    response = send_mpv_command({

        "command": [
            "get_property",
            "playback-time"
        ]

    })

    if response:

        try:

            data = json.loads(response)

            return data.get("data", 0)

        except:

            return 0

    return 0


# =========================================
# GET CURRENT DURATION
# =========================================

def get_duration():

    response = send_mpv_command({

        "command": [
            "get_property",
            "duration"
        ]

    })

    if response:

        try:

            data = json.loads(response)

            return data.get("data", 0)

        except:

            return 0

    return 0


# =========================================
# UPDATE LIVE STATE
# =========================================

def update_live_state(status):

    global current_song
    global current_volume

    state = {

        "status": status,

        "song": current_song,

        "position": get_playback_time(),

        "duration": get_duration(),

        "volume": current_volume

    }

    with open(LIVE_STATE_FILE, "w") as file:

        json.dump(state, file)


# =========================================
# PLAY SONG
# =========================================

def play_song(song):

    global mpv_process
    global current_song

    current_song = song

    # Kill previous mpv process
    if mpv_process:

        try:

            mpv_process.kill()

        except:

            pass

    # Remove old socket
    if os.path.exists(SOCKET_PATH):

        os.remove(SOCKET_PATH)

    # Start mpv
    mpv_process = subprocess.Popen([

        "mpv",

        "--no-video",

        "--idle=yes",

        "--keep-open=yes",

        "--input-ipc-server=" + SOCKET_PATH,

        "--osc=yes",

        "--save-position-on-quit",

        song

    ])

    print("Started MPV")

    time.sleep(2)

    update_live_state("PLAYING")


# =========================================
# PAUSE SONG
# =========================================

def pause_song():

    send_mpv_command({

        "command": [
            "set_property",
            "pause",
            True
        ]

    })

    update_live_state("PAUSED")


# =========================================
# RESUME SONG
# =========================================

def resume_song():

    send_mpv_command({

        "command": [
            "set_property",
            "pause",
            False
        ]

    })

    update_live_state("PLAYING")


# =========================================
# STOP SONG
# =========================================

def stop_song():

    send_mpv_command({

        "command": [
            "stop"
        ]

    })

    update_live_state("STOPPED")


# =========================================
# SEEK
# =========================================

def seek(seconds):

    send_mpv_command({

        "command": [
            "seek",
            seconds,
            "absolute"
        ]

    })


# =========================================
# VOLUME
# =========================================

def set_volume(volume):

    global current_volume

    current_volume = volume

    send_mpv_command({

        "command": [
            "set_property",
            "volume",
            volume
        ]

    })

    update_live_state("PLAYING")


# =========================================
# MAIN LOOP
# =========================================

print("OpenWave Daemon Running...")


while True:

    if os.path.exists(COMMAND_FILE):

        with open(COMMAND_FILE, "r") as file:

            command = file.read().strip()

        print("Received Command:", command)

        if command.startswith("PLAY:"):

            song = command.replace("PLAY:", "")

            print("Playing:", song)

            play_song(song)

        elif command == "PAUSE":

            print("Pausing Song")

            pause_song()

        elif command == "RESUME":

            print("Resuming Song")

            resume_song()

        elif command == "STOP":

            print("Stopping Song")

            stop_song()

        elif command.startswith("SEEK:"):

            seconds = int(command.split(":")[1])

            print("Seeking To:", seconds)

            seek(seconds)

        elif command.startswith("VOLUME:"):

            volume = int(command.split(":")[1])

            print("Volume:", volume)

            set_volume(volume)

        os.remove(COMMAND_FILE)

    # Auto update live state
    if os.path.exists(SOCKET_PATH):

        update_live_state("PLAYING")

    time.sleep(1)