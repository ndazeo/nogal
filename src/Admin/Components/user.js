import { useEffect, useRef, useState } from 'react';
import './user.css'

const User = (props) => {
    const { api, user, onClose, setUser } = props
    const [groups, setGroups] = useState([]);
    const name = useRef(user.name);
    const pass = useRef(user.password);

    useEffect(() => {
        api.getGroups().then(groups => setGroups(groups))
    }, [api])

    const handleSubmit = (event) => {
        event.preventDefault();
        user.name = name.current.value;
        user.password = pass.current.value;
        if(user._id){
            api.updateUser(user).then(() => onClose())
        }else{
            api.addUser(user).then(() => onClose())
        }
    }

    const handleGroupAdd = (event) => {
        event.preventDefault();
        user.groups.push(event.target.dataset.id);
        setUser({...user})
    }

    const handleGroupRemove = (event) => {
        event.preventDefault();
        user.groups = user.groups.filter((g) => g != event.target.dataset.id);
        setUser({...user})
    }

    return (
        <div className='userModal'>
            <div className='close nogal-btn' onClick={onClose}>&times;</div>
            <form onSubmit={handleSubmit}>
                <p>
                    <label>Name: </label>
                    <input type="text" ref={name} />
                </p>
                <p>
                    <label>Password: </label>
                    <input type="password" ref={pass} />
                </p>
                <p>
                <label>In groups:</label>
                <ul>
                    { groups && groups
                        .filter(group => user.groups.includes(group._id))
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
                        .filter(group => !user.groups.includes(group._id))
                        .map(group =>
                            <li key={group._id}>{group.name} &nbsp;
                            <i onClick={handleGroupAdd} data-id={group._id} className='fa-solid fa-plus nogal-btn'></i></li>
                        )
                    }
                </ul>
                </p>
                <p>
                    <label>Scope: </label>
                    {user.scope.join(",")}
                </p>
                <p>
                    <button type="submit">Save</button>
                </p>
            </form>
        </div>
    )
}

export default User;