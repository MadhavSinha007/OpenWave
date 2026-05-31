import {
    useEffect,
    useState
} from "react"

import Sidebar from "./components/Sidebar"
import SongCard from "./components/SongCard"
import Player from "./components/Player"

function App() {
    const [songs, setSongs] = useState([])
    const [playerState, setPlayerState] = useState({
        status: "IDLE",
        song: "",
        position: 0,
        duration: 0,
        volume: 50
    })
    const [currentSong, setCurrentSong] = useState(null)

    // =========================================
    // FETCH SONGS
    // =========================================

    useEffect(() => {
        fetch("http://127.0.0.1:8000/songs")
            .then(response => response.json())
            .then(data => {
                setSongs(data)
            })
            .catch(error => {
                console.error(error)
            })
    }, [])

    // =========================================
    // WEBSOCKET - FIXED to merge state instead of overwrite
    // =========================================

    useEffect(() => {
        const websocket = new WebSocket(
            "ws://127.0.0.1:8000/ws"
        )

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            // FIXED: Merge instead of overwrite
            setPlayerState(prev => ({
                ...prev,
                ...data
            }))
        }

        websocket.onerror = (error) => {
            console.error(error)
        }

        return () => websocket.close()
    }, [])

    // =========================================
    // SYNC CURRENT SONG WITH PLAYER STATE - FIXED trim comparison
    // =========================================

    useEffect(() => {
        if (!playerState.song) return

        const found = songs.find(
            song => song.filepath.trim() === playerState.song.trim()  // FIXED: Added trim()
        )

        if (found) {
            setCurrentSong(found)
        }
    }, [playerState.song, songs])

    // =========================================
    // PLAY
    // =========================================

    async function playSong(song) {
        try {
            await fetch(
                `http://127.0.0.1:8000/play/${song.id}`,
                {
                    method: "POST"
                }
            )
            setCurrentSong(song)
        } catch (error) {
            console.error("Error playing song:", error)
        }
    }

    // =========================================
    // PAUSE
    // =========================================

    async function pauseSong() {
        try {
            await fetch(
                "http://127.0.0.1:8000/pause",
                {
                    method: "POST"
                }
            )
        } catch (error) {
            console.error("Error pausing song:", error)
        }
    }

    // =========================================
    // RESUME
    // =========================================

    async function resumeSong() {
        try {
            await fetch(
                "http://127.0.0.1:8000/resume",
                {
                    method: "POST"
                }
            )
        } catch (error) {
            console.error("Error resuming song:", error)
        }
    }

    // =========================================
    // STOP
    // =========================================

    async function stopSong() {
        try {
            await fetch(
                "http://127.0.0.1:8000/stop",
                {
                    method: "POST"
                }
            )
            setCurrentSong(null)
        } catch (error) {
            console.error("Error stopping song:", error)
        }
    }

    // =========================================
    // NEXT
    // =========================================

    async function nextSong() {
        const currentIndex = songs.findIndex(song => song.id === currentSong?.id)
        if (currentIndex !== -1 && currentIndex + 1 < songs.length) {
            const nextTrack = songs[currentIndex + 1]
            await playSong(nextTrack)
        }
    }

    // =========================================
    // PREVIOUS
    // =========================================

    async function previousSong() {
        const currentIndex = songs.findIndex(song => song.id === currentSong?.id)
        if (currentIndex > 0) {
            const prevTrack = songs[currentIndex - 1]
            await playSong(prevTrack)
        }
    }

    // =========================================
    // VOLUME
    // =========================================

    async function volumeUp() {
        try {
            const currentVolume = playerState.volume || 50
            const newVolume = Math.min(currentVolume + 10, 100)
            await fetch(
                `http://127.0.0.1:8000/volume/${newVolume}`,
                {
                    method: "POST"
                }
            )
        } catch (error) {
            console.error("Error increasing volume:", error)
        }
    }

    async function volumeDown() {
        try {
            const currentVolume = playerState.volume || 50
            const newVolume = Math.max(currentVolume - 10, 0)
            await fetch(
                `http://127.0.0.1:8000/volume/${newVolume}`,
                {
                    method: "POST"
                }
            )
        } catch (error) {
            console.error("Error decreasing volume:", error)
        }
    }

    async function setVolume(volume) {
        try {
            await fetch(
                `http://127.0.0.1:8000/volume/${volume}`,
                {
                    method: "POST"
                }
            )
        } catch (error) {
            console.error("Error setting volume:", error)
        }
    }

    return (
        <div style={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            flexDirection: "column",
            background: "#000"
        }}>
            {/* MAIN AREA */}
            <div style={{
                flex: 1,
                display: "flex",
                overflow: "hidden"
            }}>
                {/* SIDEBAR */}
                <Sidebar />

                {/* CONTENT */}
                <div style={{
                    flex: 1,
                    padding: "30px",
                    overflowY: "scroll",
                    background: "linear-gradient(to bottom,#181818,#000)"
                }}>
                    <h1 style={{
                        color: "white",
                        marginBottom: "30px",
                        fontSize: "2rem"
                    }}>
                        Your Library
                    </h1>

                    {/* NOW PLAYING HERO SECTION - CORRECT URL (no extra /covers/) */}
                    {currentSong && (
                        <div style={{
                            display: "flex",
                            gap: "30px",
                            marginBottom: "40px",
                            alignItems: "center",
                            background: "linear-gradient(135deg, #1db95422, #181818)",
                            padding: "30px",
                            borderRadius: "20px"
                        }}>
                            <img
                                src={`http://127.0.0.1:8000/${currentSong.cover}`}
                                alt={currentSong.title}
                                style={{
                                    width: "250px",
                                    height: "250px",
                                    borderRadius: "20px",
                                    objectFit: "cover",
                                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                                }}
                                onError={(e) => {
                                    e.target.onerror = null
                                    e.target.src = "/placeholder.png"
                                }}
                            />

                            <div>
                                <h2 style={{
                                    color: "#1db954",
                                    fontSize: "1rem",
                                    letterSpacing: "2px",
                                    marginBottom: "10px"
                                }}>
                                    NOW PLAYING
                                </h2>

                                <h1 style={{
                                    color: "white",
                                    fontSize: "3rem",
                                    marginBottom: "15px"
                                }}>
                                    {currentSong.title}
                                </h1>

                                <p style={{
                                    color: "#aaa",
                                    fontSize: "1.3rem"
                                }}>
                                    {currentSong.artist}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* SONGS GRID */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
                        gap: "20px"
                    }}>
                        {
                            songs.map(song => (
                                <SongCard
                                    key={song.id}
                                    song={song}
                                    currentSong={currentSong}
                                    playSong={playSong}
                                />
                            ))
                        }
                    </div>
                </div>
            </div>

            {/* PLAYER - FIXED added setVolume prop */}
            <Player
                playerState={playerState}
                currentSong={currentSong}
                pauseSong={pauseSong}
                resumeSong={resumeSong}
                stopSong={stopSong}
                nextSong={nextSong}
                previousSong={previousSong}
                volumeUp={volumeUp}
                volumeDown={volumeDown}
                setVolume={setVolume}
            />
        </div>
    )
}

export default App