import { useState } from 'react';
import './legend.css'


const Legend = () => {
    const [hidden , setHidden] = useState(true)

    const toggleHidden = () => {
        setHidden(!hidden)
    }

    return (
        <div className="legend">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
            <span onClick={toggleHidden} class="helpicon">?</span>
            <div className={"legend-frame " + (hidden?"hidden":"")}>
                <h2>Help:</h2>
                <p></p>
                <p>Click to add.</p>
                <p>Keep <span class="keyboardKey">Ctrl</span> pressed to delete.</p>
                <p>Keep <span class="keyboardKey">Shift</span> pressed to drag.</p>
                <p>Press <span class="keyboardKey">C</span> to copy previous frame tags (overrides existing tags).</p>
                <p><span class="keyboardKey"><i class="fa fa-arrow-right"></i></span> Next frame</p>
                <p><span class="keyboardKey"><i class="fa fa-arrow-left"></i></span> Previous frame.</p>
            </div>
        </div>
    )
}

export default Legend;