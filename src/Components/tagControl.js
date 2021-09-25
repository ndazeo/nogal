import React, { useState } from "react";

const TagControl = (props) => {
    const [usedTags, setUsedTags] = useState([]);

    React.useEffect(() => {
        if(props.serie && props.serie.tags)
            setUsedTags([...props.serie.tags.reduce(
                (result, item) => (new Set([...result, item.type])), new Set()
            )]);
        else
            setUsedTags([]);
    }, [props.serie]);

    if(!props.serie)
        return (<div>Select a serie to start</div>);
        
    return (
        <div className="tag-control">
            <p>
                Frame: {props && props.frame? props.frame+1 : 0} / {props && props.serie? props.serie.shape.f : 0}
            </p>
            <p>Existing tags:</p>
            <div>
                <li>
                    {usedTags && usedTags.map((tag, index) => 
                        <ul>{tag? tag:"Marker"}</ul>
                    )}
                </li>
            </div>
            <p>Available tags:</p>
            <div>
                <li>
                    
                </li>
            </div>
        </div>
    )
}

export default TagControl;
