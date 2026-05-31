function SongCard({
    song,
    currentSong,
    playSong
}) {

    const isPlaying =
        currentSong?.filepath === song.filepath

    return (

        <div style={{

            background: isPlaying
                ? "#1db95422"
                : "#181818",

            borderRadius: "16px",

            padding: "18px",

            transition: "0.3s",

            border: isPlaying
                ? "1px solid #1db954"
                : "1px solid #222"
        }}>

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
            />

            <h3 style={{

                color: "white",

                fontSize: "1rem",

                marginBottom: "6px"
            }}>
                {song.title}
            </h3>

            <p style={{

                color: "#999",

                marginBottom: "15px"
            }}>
                {song.artist}
            </p>

            <button

                onClick={() => playSong(song)}

                style={{

                    width: "100%",

                    background: "#1db954",

                    color: "white",

                    border: "none",

                    padding: "12px",

                    borderRadius: "999px",

                    cursor: "pointer"
                }}
            >

                {isPlaying
                    ? "🎵 Playing"
                    : "▶ Play"}

            </button>

        </div>
    )
}

export default SongCard