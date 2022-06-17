import React, { useState, useCallback } from "react";
import './tagControl.css'

const TagControl = (props) => {
    const [usedTags, setUsedTags] = useState([]);
    const { setTag, currentTag, tags, updateSeriesTags, toogleDoubt, elementTags, selectedImage } = props;
    
    React.useEffect(() => {
        if (selectedImage && selectedImage.tags)
            setUsedTags(selectedImage.tags.reduce(
                (r, i) => !r.find(e => e === i.k) ? [i.k, ...r] : r, []
            ));
        else
            setUsedTags([]);
    }, [selectedImage]);

    const handleTagChange = (tag) => (event) => {
        event.preventDefault();
        setTag(currentTag => !currentTag || currentTag._id!==tag._id ? tag : null);
    };

    const doubt = useCallback((tag) => {
        return elementTags 
        && elementTags.find(e => 
                e.k === tag._id
                && e.x === -1 && e.y === -1)
    }, [elementTags])

    const toogleHide = (tag) => (event) => {
        if(tag.hidden)
            tag.hidden = false;
        else
            tag.hidden = true;
        updateSeriesTags(tags => tags.map(t => t._id === tag._id ? tag : t));
    }


    if (!selectedImage)
        return (<div>Select an image to start</div>);

    const tagDOMElem = (tag) => (
        <li key={tag._id} className={currentTag && currentTag._id === tag._id ? "selectedSerie" : null}>
            <a href={tag.n} 
                onClick={handleTagChange(tag)} 
                style={{ color: currentTag && currentTag._id === tag._id ? "white" : tag.c }}>
                {tag.n}
            </a>
            <button className="nobutton eyebutton" onClick={toogleHide(tag)}>
                { tag.hidden ?
                    <i className="far fa-eye-slash fa-gray"></i>
                     : 
                    <i className="far fa-eye"></i>
                }
            </button>
            <button className="nobutton eyebutton" onClick={toogleDoubt(tag)}>
                { !doubt(tag) ?
                    <i className="fa fa-triangle-exclamation fa-gray"></i>
                     : 
                    <i className="fa fa-triangle-exclamation fa-yellow"></i>
                }
            </button>
        
        </li>
    )

    return (
        <div className="tag-control">
            <p>
                {selectedImage && selectedImage.name}
            </p>
            <p>Existing tags:</p>
            <div className="tagsList">
                <ul>
                    {tags && tags
                        .filter(tag => usedTags && usedTags.find(t => t === tag._id))
                        .sort((a, b) => a.n.localeCompare(b.n))
                        .map(tagDOMElem)}
                </ul>
            </div>
            <p>Available tags:</p>
            <div className="tagsList">
                <ul>
                    {tags && tags
                        .filter(tag => !usedTags || !usedTags.find(t => t === tag._id))
                        .sort((a, b) => a.n.localeCompare(b.n))
                        .map(tagDOMElem)}
                </ul>
            </div>
        </div>
    )
}

export default TagControl;
