import { useEffect, useState, useContext } from 'react';
import { APIContext } from '../../Services/api';
import Loading from '../../Components/loading';
import Tag from './tag';

const Tags = (props) => {
    const { api } = useContext(APIContext)
    const [tags, setTags] = useState([]);
    const [tagid, setTagId] = useState(null);
    const [tag, setTag] = useState(null);

    useEffect(() => {
        if(!tagid)
            setTag(null)
        else if(tagid === 'new')
            setTag({groups:[]})
        else
            setTag(tags.find(t => t._id === tagid))
    }, [tagid, tags])


    useEffect(() => {
        api.getTags().then(tags => setTags(tags))
    }, [api])


    const handleTagSelect = (event) => {
        event.preventDefault();
        setTagId(event.target.dataset.id);
    };

    const handleTagClose = (event) => {
        api.getTags().then(tags => setTags(tags))
        setTagId(null);
    }

    const handleNewClick = (event) => {
        setTagId('new')
    }

    return (
        <div>
            <ul>
            {
                tags.map(tag => {
                    return (
                    <li key={tag._id}>{tag.n} &nbsp;
                        <div className="fa-solid fa-pen-to-square nogal-btn" data-id={tag._id} onClick={handleTagSelect}></div>
                    </li>
                    )
                })
            }
            </ul>
            <div className="fa-solid fa-plus nogal-btn" onClick={handleNewClick}></div>
            <Loading visible={tagid && !tag} full={true} />
            {tag && <Tag tag={tag} api={api} onClose={handleTagClose} setTag={setTag} />}
        </div>
    )
}

export default Tags;