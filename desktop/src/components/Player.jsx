import { useEffect, useState } from "react"

function formatTime(seconds) {
    if (!seconds)
        return "0:00"

    const mins =
        Math.floor(seconds / 60)

    const secs =
        Math.floor(seconds % 60)

    return `${mins}:${secs
        .toString()
        .padStart(2, "0")}`
}

function Player({
    playerState,
    currentSong,
    pauseSong,
    resumeSong,
    stopSong,
    nextSong,
    previousSong,
    volumeUp,
    volumeDown,
    setVolume
}) {
    const progress =
        playerState.duration > 0
            ? (playerState.position / playerState.duration) * 100
            : 0

    // Local volume state for smooth slider updates
    const [localVolume, setLocalVolume] = useState(playerState.volume || 50)

    useEffect(() => {
        setLocalVolume(playerState.volume || 50)
    }, [playerState.volume])

    const buttonStyle = {
        background: "#1db954",
        border: "none",
        color: "white",
        padding: "8px 16px",
        borderRadius: "999px",
        fontWeight: "bold",
        cursor: "pointer",
        fontSize: "12px"
    }

    const iconButtonStyle = {
        background: "none",
        border: "none",
        color: "white",
        fontSize: "20px",
        cursor: "pointer",
        padding: "5px 10px",
        borderRadius: "4px"
    }

    const handleSeek = async (e) => {
        if (!currentSong || playerState.duration === 0) return

        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const width = rect.width
        const percentage = x / width
        const seekTime = Math.floor(percentage * playerState.duration)

        try {
            await fetch(`http://127.0.0.1:8000/seek/${seekTime}`, {
                method: "POST"
            })
        } catch (error) {
            console.error("Error seeking:", error)
        }
    }

    const handleVolumeChange = async (e) => {
        const newVolume = parseInt(e.target.value)
        setLocalVolume(newVolume)  // Update local state immediately
        if (setVolume) {
            setVolume(newVolume)
        } else {
            try {
                await fetch(`http://127.0.0.1:8000/volume/${newVolume}`, {
                    method: "POST"
                })
            } catch (error) {
                console.error("Error changing volume:", error)
            }
        }
    }

    return (
        <div style={{
            height: "110px",
            background: "#121212",
            borderTop: "1px solid #222",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 25px"
        }}>
            {/* LEFT - SONG INFO - CORRECT URL (no extra /covers/) */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                width: "25%"
            }}>
                <img
                    src={
                        currentSong?.cover
                            ? `http://127.0.0.1:8000/${currentSong.cover}`
                            : "/placeholder.png"
                    }
                    alt=""
                    style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "10px",
                        objectFit: "cover"
                    }}
                    onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "/placeholder.png"
                    }}
                />

                <div>
                    <div style={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "14px"
                    }}>
                        {currentSong?.title || "No Song Playing"}
                    </div>

                    <div style={{
                        color: "#888",
                        fontSize: "12px"
                    }}>
                        {currentSong?.artist || ""}
                    </div>
                </div>
            </div>

            {/* CENTER - CONTROLS & PROGRESS */}
            <div style={{
                width: "50%"
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "12px",
                    marginBottom: "10px"
                }}>
                    <button
                        onClick={previousSong}
                        disabled={!currentSong}
                        style={{
                            ...iconButtonStyle,
                            opacity: currentSong ? 1 : 0.5,
                            cursor: currentSong ? "pointer" : "not-allowed"
                        }}
                    >
                        ⏮
                    </button>

                    <button
                        onClick={pauseSong}
                        disabled={!currentSong}
                        style={{
                            ...buttonStyle,
                            opacity: currentSong ? 1 : 0.5,
                            cursor: currentSong ? "pointer" : "not-allowed"
                        }}
                    >
                        Pause
                    </button>

                    <button
                        onClick={resumeSong}
                        disabled={!currentSong}
                        style={{
                            ...buttonStyle,
                            opacity: currentSong ? 1 : 0.5,
                            cursor: currentSong ? "pointer" : "not-allowed"
                        }}
                    >
                        Play
                    </button>

                    <button
                        onClick={stopSong}
                        disabled={!currentSong}
                        style={{
                            ...buttonStyle,
                            background: "#333",
                            opacity: currentSong ? 1 : 0.5,
                            cursor: currentSong ? "pointer" : "not-allowed"
                        }}
                    >
                        Stop
                    </button>

                    <button
                        onClick={nextSong}
                        disabled={!currentSong}
                        style={{
                            ...iconButtonStyle,
                            opacity: currentSong ? 1 : 0.5,
                            cursor: currentSong ? "pointer" : "not-allowed"
                        }}
                    >
                        ⏭
                    </button>
                </div>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                }}>
                    <span style={{
                        color: "#aaa",
                        fontSize: "12px",
                        minWidth: "35px"
                    }}>
                        {formatTime(playerState.position)}
                    </span>

                    <div
                        onClick={handleSeek}
                        style={{
                            flex: 1,
                            height: "5px",
                            background: "#333",
                            borderRadius: "999px",
                            cursor: currentSong ? "pointer" : "default",
                            position: "relative"
                        }}
                    >
                        <div style={{
                            width: `${progress}%`,
                            height: "100%",
                            background: "#1db954",
                            borderRadius: "999px",
                            transition: "width 0.1s linear"
                        }} />
                    </div>

                    <span style={{
                        color: "#aaa",
                        fontSize: "12px",
                        minWidth: "35px"
                    }}>
                        {formatTime(playerState.duration)}
                    </span>
                </div>
            </div>

            {/* RIGHT - VOLUME */}
            <div style={{
                width: "25%",
                textAlign: "right",
                color: "#aaa",
                fontSize: "12px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "15px",
                alignItems: "center"
            }}>
                <span>🔊</span>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={localVolume}
                    onChange={handleVolumeChange}
                    style={{
                        width: "100px",
                        height: "4px",
                        WebkitAppearance: "none",
                        background: "#333",
                        borderRadius: "2px",
                        outline: "none"
                    }}
                />
                <span style={{ minWidth: "35px" }}>
                    {localVolume}%
                </span>
            </div>
        </div>
    )
}

export default Player