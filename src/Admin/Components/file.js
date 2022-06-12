import { useEffect, useRef, useState } from 'react';


const File = (props) => {
    const { api, file, onClose, setFile } = props
    const [groups, setGroups] = useState([]);
    const name = useRef();
    const path = useRef();

    useEffect(() => {
        name.current.value = file.name
        path.current.value = file.path
    }, [file])

    useEffect(() => {
        api.getGroups().then(groups => setGroups(groups))
    }, [api])

    const handleSubmit = (event) => {
        event.preventDefault();
        file.name = name.current.value;
        file.path = path.current.value;
        if(file._id){
            api.updateFile(file).then(() => onClose())
        }else{
            api.addFile(file).then(() => onClose())
        }
    }

    const handleGroupAdd = (event) => {
        event.preventDefault();
        file.groups.push(event.target.dataset.id);
        setFile({...file})
    }

    const handleGroupRemove = (event) => {
        event.preventDefault();
        file.groups = file.groups.filter((g) => g !== event.target.dataset.id);
        setFile({...file})
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
                    <label>Path: </label>
                    <input type="text" ref={path} />
                </p>
                <p>
                <label>In groups:</label>
                <ul>
                    { groups && groups
                        .filter(group => file.groups.includes(group._id))
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
                        .filter(group => !file.groups.includes(group._id))
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

export default File;