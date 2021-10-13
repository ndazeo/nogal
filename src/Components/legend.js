import { useState } from 'react';
import './legend.css'


const Legend = () => {
    const [hidden , setHidden] = useState(true)

    const toggleHidden = () => {
        setHidden(!hidden)
    }

    return (
        <div className="legend">
            <a href="#" onClick={toggleHidden} class="helpicon">?</a>
            <div className={"legend-frame " + (hidden?"hidden":"")}>
                <h2>Help:</h2>
                <p></p>
                <p>Click to add.</p>
                <p>Keep Ctrl pressed to delete.</p>
                <p>Keep Shift pressed to drag.</p>
                <p>Press C to copy previous frame tags (overrides existing tags).</p>
            </div>
        </div>
    )
}

export default Legend;