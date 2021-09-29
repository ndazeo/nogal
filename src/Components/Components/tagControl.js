import React, { useState } from "react";
import { getTags } from '../model/api'
import './tagControl.css'

const isInt = (value) => parseInt(value, 10) === value;

const TagControl = (props) => {
    const [usedTags, setUsedTags] = useState([]);
    const [tags, setTags] = useState([]);

    const { setTag, currentTag } = props;

    React.useEffect(() => {
        getTags().then(setTags);
    }, []);

    React.useEffect(() => {
        if (props.serie && props.serie.tags)
            setUsedTags(props.serie.tags.reduce(
                (r, i) => !r.find(e => e.n===i.type.n)? [i.type,...r]:r, []
            ));
        else
            setUsedTags([]);
    }, [props.serie]);

    const handleTagChange = (tag) => (event) => {
        event.preventDefault();
        setTag(tag);
    };

    if (!props.serie)
        return (<div>Select a serie to start</div>);

    return (
        <div className="tag-control">
            <p>
                Frame: {props && isInt(props.frame) ? props.frame + 1 : 0} / {props && props.serie ? props.serie.shape.f : 0}
            </p>
            <p>Existing tags:</p>
            <div class="tagsList">
                <ul>
                    {usedTags && usedTags.map((tag, index) =>
                        <li className={currentTag && currentTag === tag ? "selectedSerie" : null}>
                            <a href={tag.n} onClick={handleTagChange(tag)}>{tag.n}</a>
                        </li>
                    )}
                </ul>
            </div>
            <p>Available tags:</p>
            <div class="tagsList">
                <ul>
                    {tags && tags
                        .filter(tag => !usedTags || !usedTags.find(t => t.n === tag.n))
                        .map((tag, index) =>
                            <li className={currentTag && currentTag === tag ? "selectedSerie" : null}>
                                <a href={tag.n} onClick={handleTagChange(tag)}>{tag.n}</a>
                            </li>
                        )}
                </ul>
            </div>
        </div>
    )
}

export default TagControl;
