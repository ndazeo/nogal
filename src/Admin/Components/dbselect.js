import { useContext } from "react"
import { APIContext } from "../../Services/api"
import './dbselect.css'

export const DBSelect = () => {
    const { api } = useContext(APIContext)


    return (
        <select className="dbName" defaultValue={api.db}>
            <option value={api.db}>{api.db}</option>
        </select>
    )
}
    