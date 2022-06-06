import Users from './Components/users.js'

const AdminConsole = (props) => {
    const { api } = props

    return (
        <Users api={api}></Users>
    )
}

export default AdminConsole;