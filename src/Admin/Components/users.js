import { useEffect, useState, useContext } from 'react';
import { APIContext } from '../../Services/api';
import Loading from '../../Components/loading';
import User from './user';

const Users = (props) => {
    const { api } = useContext(APIContext)
    const [users, setUsers] = useState([]);
    const [userid, setUserId] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        if(!userid)
            setUser(null)
        else
            setUser(users.find(u => u._id === userid))
    }, [userid, users])


    useEffect(() => {
        api.getUsers().then(users => setUsers(users))
    }, [api])


    const handleUserSelect = (event) => {
        event.preventDefault();
        setUserId(event.target.dataset.id);
    };

    const handleUserClose = (event) => {
        api.getUsers().then(users => setUsers(users))
        setUserId(null);
    }

    const handleNewClick = (event) => {
        setUser({groups:[], scope:["tag"], home:"/imagetagger"})
    }

    return (
        <div>
            <ul>
            {
                users.map(user => {
                    return (
                    <li key={user._id}>{user.name} &nbsp;
                        <div className="fa-solid fa-pen-to-square nogal-btn" data-id={user._id} onClick={handleUserSelect}></div>
                    </li>
                    )
                })
            }
            </ul>
            <div className="fa-solid fa-plus nogal-btn" onClick={handleNewClick}></div>
            <Loading visible={userid && !user} full={true} />
            {user && <User user={user} api={api} onClose={handleUserClose} setUser={setUser} />}
        </div>
    )
}

export default Users;