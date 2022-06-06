import { useEffect, useState } from 'react';


const Users = (props) => {
    const { api } = props
    const [users, setUsers] = useState([]);

    useEffect(() => {
        api.getUsers().then(users => setUsers(users))
    }, [api])

    return (
        <ul>
        {
            users.map(user => {
                return (<li>{user.name}</li>)
            })
        }
        </ul>
    )
}

export default Users;