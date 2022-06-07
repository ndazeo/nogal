import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Nav from "../Components/nav.js";
import Users from './Components/users.js'

const AdminConsole = (props) => {
    const { api } = props

    return (
        <div>
            <Nav>
                <NavLink to="users">Users</NavLink>
            </Nav>
            <Router>
                <Routes>
                    <Route path="/" element={<Users api={api} />} />
                </Routes>
            </Router>
        </div>
    )
}

export default AdminConsole;