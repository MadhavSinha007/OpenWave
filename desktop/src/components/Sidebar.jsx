import {

    FaHome,
    FaMusic,
    FaHeart

} from "react-icons/fa"

function Sidebar() {

    return (

        <div style={{

            width: "240px",

            background: "#0b0b0b",

            padding: "30px 20px",

            display: "flex",

            flexDirection: "column",

            gap: "25px",

            borderRight:
                "1px solid #1e1e1e"
        }}>

            <h1 style={{

                color: "#1db954",

                fontSize: "2rem",

                marginBottom: "30px"
            }}>

                OpenWave

            </h1>

            <button style={buttonStyle}>
                <FaHome />
                Home
            </button>

            <button style={buttonStyle}>
                <FaMusic />
                Library
            </button>

            <button style={buttonStyle}>
                <FaHeart />
                Favorites
            </button>

        </div>
    )
}

const buttonStyle = {

    background: "transparent",

    border: "none",

    color: "#b3b3b3",

    display: "flex",

    alignItems: "center",

    gap: "12px",

    fontSize: "1rem",

    padding: "10px"
}

export default Sidebar