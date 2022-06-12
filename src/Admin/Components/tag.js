import { useEffect, useRef, useState } from 'react';


const Tag = (props) => {
    const { api, tag, onClose, setTag } = props
    const [groups, setGroups] = useState([]);
    const name = useRef();
    const [line, setLine] = useState(tag.l);
    const color = useRef();

    useEffect(() => {
        name.current.value = tag.n
        color.current.value = tag.c
    }, [tag])

    useEffect(() => {
        api.getGroups().then(groups => setGroups(groups))
    }, [api])

    const handleSubmit = (event) => {
        event.preventDefault();
        tag.n = name.current.value;
        tag.l = line;
        tag.c = color.current.value;
        if(tag._id){
            api.updateTag(tag).then(() => onClose())
        }else{
            api.addTag(tag).then(() => onClose())
        }
    }

    const handleGroupAdd = (event) => {
        event.preventDefault();
        tag.groups.push(event.target.dataset.id);
        setTag({...tag})
    }

    const handleGroupRemove = (event) => {
        event.preventDefault();
        tag.groups = tag.groups.filter((g) => g !== event.target.dataset.id);
        setTag({...tag})
    }

    const handleLineChange = (event) => {
        setLine(parseInt(event.target.value));
    }

    return (
        <div className='editModal'>
            <div className='close nogal-btn' onClick={onClose}>&times;</div>
            <form onSubmit={handleSubmit}>
                <p>
                    <label>Name: </label>
                    <input type="text" ref={name} />
                </p>
                <p>
                    <label>Color: </label>
                    <input type="text" ref={color} />
                </p>
                <div>
                    <label>Is line: </label>
                    <ul style={{listStyleType: "none", "padding": 0}}>
                        <li>
                            <input type="radio" name="line" value={1} checked={line===1} onChange={handleLineChange} />
                            &nbsp; Yes
                        </li>
                        <li>
                            <input type="radio" name="line" value={0} checked={line!==1} onChange={handleLineChange} />
                            &nbsp; No
                        </li>
                    </ul>
                </div>
                <p>
                <label>In groups:</label>
                <ul>
                    { groups && groups
                        .filter(group => tag.groups.includes(group._id))
                        .map(group =>
                            <li key={group._id}>{group.name} &nbsp;
                            <i onClick={handleGroupRemove} data-id={group._id} className='fa-solid fa-minus nogal-btn'></i></li>
                        )
                    }
                </ul>
                </p>
                <p>
                <label>Available groups:</label>
                <ul>
                    { groups && groups 
                        .filter(group => !tag.groups.includes(group._id))
                        .map(group =>
                            <li key={group._id}>{group.name} &nbsp;
                            <i onClick={handleGroupAdd} data-id={group._id} className='fa-solid fa-plus nogal-btn'></i></li>
                        )
                    }
                </ul>
                </p>
                <p>
                    <button type="submit">Save</button>
                </p>
            </form>
        </div>
    )
}

export default Tag;