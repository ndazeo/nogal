import React, { useState } from "react";
import './tagControl.css'

const isInt = (value) => parseInt(value, 10) === value;

const TagControl = (props) => {
    const [usedTags, setUsedTags] = useState([]);

    const { setTag, currentTag, tags, serie, updateTags } = props;

    React.useEffect(() => {
        if (serie && serie.tags)
            setUsedTags(serie.tags.reduce(
                (r, i) => !r.find(e => e === i.k) ? [i.k, ...r] : r, []
            ));
        else
            setUsedTags([]);
    }, [serie]);

    const handleTagChange = (tag) => (event) => {
        event.preventDefault();
        setTag(tag);
    };

    const toogleHide = (tag) => (event) => {
        if(tag.hidden)
            tag.hidden = false;
        else
            tag.hidden = true;
        updateTags(tags => tags.map(t => t._id === tag._id ? tag : t));
    }

    if (!serie)
        return (<div>Select a serie to start</div>);

    const tagDOMElem = (tag) => (
        <li className={currentTag && currentTag._id === tag._id ? "selectedSerie" : null}>
            <a href={tag.n} 
                onClick={handleTagChange(tag)} 
                style={{ color: currentTag && currentTag._id === tag._id ? "white" : tag.c }}>
                {tag.n}
            </a>
            <button className="nobutton eyebutton" onClick={toogleHide(tag)}>
                { tag.hidden ?
                    <i className="fa fa-eye fa-gray"></i>
                     : 
                    <i className="fa fa-eye"></i>
                }
            </button>
        
        </li>
    )

    return (
        <div className="tag-control">
            <p>
                Frame: {props && isInt(props.frame) ? props.frame + 1 : 0} / {props && serie ? serie.shape.f : 0}
            </p>
            <p>Existing tags:</p>
            <div className="tagsList">
                <ul>
                    {tags && tags
                        .filter(tag => usedTags && usedTags.find(t => t === tag._id))
                        .map(tagDOMElem)}
                </ul>
            </div>
            <p>Available tags:</p>
            <div className="tagsList">
                <ul>
                    {tags && tags
                        .filter(tag => !usedTags || !usedTags.find(t => t === tag._id))
                        .map(tagDOMElem)}
                </ul>
            </div>
        </div>
    )
}

export default TagControl;
