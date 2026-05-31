function SongCard({
    song,
    currentSong,
    playSong
}) {
    const isPlaying = currentSong?.id === song.id

    return (
        <div style={{
            background: isPlaying ? "#1db95422" : "#181818",
            borderRadius: "16px",
            padding: "18px",
            transition: "0.3s",
            border: isPlaying ? "1px solid #1db954" : "1px solid #222"
        }}>
            {/* COVER */}
            <img
                src={`http://127.0.0.1:8000/${song.cover}`}
                alt={song.title}
                style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    marginBottom: "15px"
                }}
                onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "/placeholder.png"
                }}
            />

            {/* TITLE */}
            <h3 style={{
                color: "white",
                fontSize: "1rem",
                marginBottom: "8px"
            }}>
                {song.title}
            </h3>

            {/* ARTIST */}
            <p style={{
                color: "#999",
                fontSize: "0.9rem",
                marginBottom: "15px"
            }}>
                {song.artist}
            </p>

            {/* PLAY */}
            <button
                onClick={() => playSong(song.id, song.title, song.artist)}
                style={{
                    width: "100%",
                    background: "#1db954",
                    color: "white",
                    border: "none",
                    padding: "12px",
                    borderRadius: "999px",
                    fontWeight: "bold",
                    cursor: "pointer"
                }}
            >
                {isPlaying ? "Playing" : "Play"}
            </button>
        </div>
    )
}

export default SongCard