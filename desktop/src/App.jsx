import { useEffect, useState } from "react"

function App() {
    const [songs, setSongs] = useState([])
    const [playerState, setPlayerState] = useState({
        status: "IDLE",
        song: ""
    })
    const [ws, setWs] = useState(null)
    const [currentSong, setCurrentSong] = useState(null)

    // Fetch songs on component mount
    useEffect(() => {
        fetch("http://localhost:8000/songs")
            .then(response => response.json())
            .then(data => {
                setSongs(data)
            })
            .catch(error => console.error("Error fetching songs:", error))
    }, [])

    // WebSocket connection for live player state
useEffect(() => {

    const websocket = new WebSocket("ws://localhost:8000/ws")

    websocket.onopen = () => {

        console.log("WebSocket connected")
    }

    websocket.onmessage = (event) => {

        const data = JSON.parse(event.data)

        setPlayerState(data)
    }

    websocket.onerror = (error) => {

        console.error("WebSocket error:", error)
    }

    websocket.onclose = () => {

        console.log("WebSocket disconnected")
    }

    return () => {

        websocket.close()
    }

}, [])

    async function playSong(id, songTitle, songArtist) {
        try {
            await fetch(`http://localhost:8000/play/${id}`, {
                method: "POST"
            })
            setCurrentSong({ id, title: songTitle, artist: songArtist })
        } catch (error) {
            console.error("Error playing song:", error)
        }
    }

    async function pauseSong() {
        try {
            await fetch("http://localhost:8000/pause", {
                method: "POST"
            })
        } catch (error) {
            console.error("Error pausing song:", error)
        }
    }

    async function resumeSong() {
        try {
            await fetch("http://localhost:8000/resume", {
                method: "POST"
            })
        } catch (error) {
            console.error("Error resuming song:", error)
        }
    }

    async function stopSong() {
        try {
            await fetch("http://localhost:8000/stop", {
                method: "POST"
            })
            setCurrentSong(null)
        } catch (error) {
            console.error("Error stopping song:", error)
        }
    }

    // Get status icon and color
    const getStatusInfo = () => {
        switch(playerState.status) {
            case "PLAYING":
                return { icon: "🎵", color: "#1db954", text: "Now Playing" }
            case "PAUSED":
                return { icon: "⏸️", color: "#ffa500", text: "Paused" }
            case "IDLE":
                return { icon: "⏹️", color: "#666", text: "Idle" }
            default:
                return { icon: "🎵", color: "#1db954", text: playerState.status }
        }
    }

    const statusInfo = getStatusInfo()

    return (
        <div style={{
            background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
            color: "white",
            minHeight: "100vh",
            padding: "20px",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
            {/* Header */}
            <div style={{
                textAlign: "center",
                marginBottom: "40px",
                padding: "20px"
            }}>
                <h1 style={{
                    fontSize: "3rem",
                    background: "linear-gradient(135deg, #1db954 0%, #1ed760 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    marginBottom: "10px"
                }}>
                    OpenWave 🎧
                </h1>
                <p style={{ opacity: 0.7, fontSize: "1rem" }}>
                    Your Modern Music Streaming Platform
                </p>
            </div>

            {/* Now Playing Section */}
            {(playerState.status !== "IDLE" || currentSong) && (
                <div style={{
                    background: "rgba(29, 185, 84, 0.1)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "15px",
                    padding: "20px",
                    marginBottom: "30px",
                    border: "1px solid rgba(29, 185, 84, 0.3)",
                    animation: "slideIn 0.3s ease-out"
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "20px"
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: "0.85rem",
                                textTransform: "uppercase",
                                letterSpacing: "2px",
                                color: statusInfo.color,
                                marginBottom: "10px"
                            }}>
                                {statusInfo.icon} {statusInfo.text}
                            </div>
                            <div style={{
                                fontSize: "1.5rem",
                                fontWeight: "bold",
                                marginBottom: "5px"
                            }}>
                                {currentSong?.title || playerState.song?.split('/').pop() || "No song playing"}
                            </div>
                            <div style={{
                                opacity: 0.7,
                                fontSize: "0.9rem"
                            }}>
                                {currentSong?.artist || "Unknown Artist"}
                            </div>
                        </div>
                        
                        <div style={{
                            display: "flex",
                            gap: "15px"
                        }}>
                            {playerState.status === "PLAYING" && (
                                <button
                                    onClick={pauseSong}
                                    style={{
                                        background: "#333",
                                        border: "none",
                                        padding: "12px 20px",
                                        borderRadius: "10px",
                                        cursor: "pointer",
                                        color: "white",
                                        fontSize: "1rem",
                                        transition: "all 0.3s ease"
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = "#444"}
                                    onMouseLeave={(e) => e.target.style.background = "#333"}
                                >
                                    ⏸️ Pause
                                </button>
                            )}
                            
                            {playerState.status === "PAUSED" && (
                                <button
                                    onClick={resumeSong}
                                    style={{
                                        background: "#1db954",
                                        border: "none",
                                        padding: "12px 20px",
                                        borderRadius: "10px",
                                        cursor: "pointer",
                                        color: "white",
                                        fontSize: "1rem",
                                        transition: "all 0.3s ease"
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = "#1ed760"}
                                    onMouseLeave={(e) => e.target.style.background = "#1db954"}
                                >
                                    ▶️ Resume
                                </button>
                            )}
                            
                            <button
                                onClick={stopSong}
                                style={{
                                    background: "#dc3545",
                                    border: "none",
                                    padding: "12px 20px",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    color: "white",
                                    fontSize: "1rem",
                                    transition: "all 0.3s ease"
                                }}
                                onMouseEnter={(e) => e.target.style.background = "#c82333"}
                                onMouseLeave={(e) => e.target.style.background = "#dc3545"}
                            >
                                ⏹️ Stop
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Music Library Section */}
            <div>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px"
                }}>
                    <h3 style={{ fontSize: "1.5rem" }}>
                        Your Music Library
                    </h3>
                    <span style={{
                        background: "#1db954",
                        padding: "5px 12px",
                        borderRadius: "20px",
                        fontSize: "0.85rem"
                    }}>
                        {songs.length} songs
                    </span>
                </div>

                <div style={{
                    display: "grid",
                    gap: "12px"
                }}>
                    {songs.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "60px",
                            opacity: 0.5
                        }}>
                            🎵 No songs found in your library
                        </div>
                    ) : (
                        songs.map(song => (
                            <div
                                key={song.id}
                                style={{
                                    padding: "20px",
                                    background: currentSong?.id === song.id ? "rgba(29, 185, 84, 0.15)" : "#151515",
                                    borderRadius: "12px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    transition: "all 0.3s ease",
                                    cursor: "pointer",
                                    border: currentSong?.id === song.id ? "1px solid rgba(29, 185, 84, 0.5)" : "1px solid transparent",
                                    animation: "fadeIn 0.5s ease-out"
                                }}
                                onMouseEnter={(e) => {
                                    if (currentSong?.id !== song.id) {
                                        e.currentTarget.style.background = "#1e1e1e"
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (currentSong?.id !== song.id) {
                                        e.currentTarget.style.background = "#151515"
                                    }
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: "1.1rem",
                                        fontWeight: "500",
                                        marginBottom: "5px",
                                        color: currentSong?.id === song.id ? "#1db954" : "white"
                                    }}>
                                        {song.title}
                                    </div>
                                    <div style={{
                                        opacity: 0.7,
                                        fontSize: "0.85rem"
                                    }}>
                                        {song.artist}
                                    </div>
                                </div>
                                
                                {currentSong?.id === song.id && playerState.status === "PLAYING" && (
                                    <div style={{
                                        marginRight: "15px",
                                        animation: "pulse 1.5s ease-in-out infinite"
                                    }}>
                                        🎵
                                    </div>
                                )}
                                
                                <button
                                    onClick={() => playSong(song.id, song.title, song.artist)}
                                    style={{
                                        background: currentSong?.id === song.id && playerState.status === "PLAYING" ? "#1db954" : "#333",
                                        border: "none",
                                        padding: "10px 20px",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        color: "white",
                                        fontSize: "0.9rem",
                                        fontWeight: "500",
                                        transition: "all 0.3s ease",
                                        minWidth: "80px"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (currentSong?.id !== song.id || playerState.status !== "PLAYING") {
                                            e.target.style.background = "#1db954"
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (currentSong?.id !== song.id || playerState.status !== "PLAYING") {
                                            e.target.style.background = "#333"
                                        }
                                    }}
                                >
                                    {currentSong?.id === song.id && playerState.status === "PLAYING" ? "Playing" : "Play"}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }
                
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    )
}

export default App