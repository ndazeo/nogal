import { Routes, Route, NavLink } from "react-router-dom";
import { DBSelect } from "./Components/dbselect.js";
import Users from './Components/users.js'
import Files from './Components/files.js'
import Tags from './Components/tags.js'

import './console.css'

const AdminConsole = (props) => {

    return (
        <div>
            <nav className="console_nav">
                <li>
                    <NavLink to="users">Users</NavLink>
                    <NavLink to="files">Files</NavLink>
                    <NavLink to="tags">Tags</NavLink>
                </li>
                <DBSelect></DBSelect>
            </nav>
            <Routes>
                <Route path="/" element={<div></div>} />
                <Route path="/users" element={<Users />} />
                <Route path="/files" element={<Files />} />
                <Route path="/tags" element={<Tags />} />
            </Routes>
        </div>
    )
}

export default AdminConsole;