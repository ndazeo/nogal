import { useState } from 'react';
import './legend.css'


const Legend = () => {
    const [hidden , setHidden] = useState(true)

    const toggleHidden = () => {
        setHidden(!hidden)
    }

    return (
        <div className="legend">
            <span onClick={toggleHidden} className="helpicon">?</span>
            <div className={"legend-frame " + (hidden?"hidden":"")}>
                <h2>Help:</h2>
                <p></p>
                <p>Vertical Scroll for zoom</p>
                <p>Click with seleced tag for tagging</p>
                <p>Esc to unselect tag</p>
                <p>Click without selected tag for pan</p>
                <p>Keep <span className="keyboardKey">Ctrl</span> pressed to delete.</p>
                <p>Keep <span className="keyboardKey">Shift</span> pressed to drag.</p>
                <p>Press <span className="keyboardKey">C</span> to copy previous frame tags.</p>
                <p>Press <span className="keyboardKey">Y</span> to yank current frame tags to the buffer.</p>
                <p>Press <span className="keyboardKey">P</span> to replace current frame tags with the buffer.</p>
                <p><span className="keyboardKey"><i className="fa fa-arrow-right"></i></span> Next frame</p>
                <p><span className="keyboardKey"><i className="fa fa-arrow-left"></i></span> Previous frame.</p>
            </div>
        </div>
    )
}

export default Legend;