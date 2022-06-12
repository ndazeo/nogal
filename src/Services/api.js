import React from 'react'

const URL = process.env.REACT_APP_API_URL

const apiFetch = (token, updateAPI) => async (url, params) => {
    const response = await fetch(`${url}`, params)
    if (response.status === 401) updateAPI({token:null})
    return response
}


export const createAPI = (props) => {
    const { db, token, updateAPI } = props;
    const fetch = apiFetch(token, updateAPI);

    const api = {
        token: token,
        URL: URL,
        db: db,
        update: updateAPI,

        login: async (user) => {
            const response = await fetch(`${URL}/auth/login`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': user
                }
            })
            if (response.status === 200)
                return await response.text()
            else
                return null
        },

        getUsers: async () => {
            const response = await fetch(`${URL}/users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            return data
        },

        getUser: async () => {
            const response = await fetch(`${URL}/auth/user`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const user = await response.json()
            return user
        },

        addUser: async (user) => {
            const response = await fetch(`${URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(user)
            })
            const data = await response.json()
            return data
        },

        updateUser: async (user) => {
            const response = await fetch(`${URL}/users/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(user)
            })
            const data = await response.json()
            return data
        },

        getGroups: async () => {
            const response = await fetch(`${URL}/groups`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            return data
        },

        getFiles: async () => {
            const response = await fetch(`${URL}/db/${db}/files`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            return data
        },

        addFile: async (file) => {
            const response = await fetch(`${URL}/db/${db}/files`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(file)
            })
            const data = await response.json()
            return data
        },

        updateFile: async (file) => {
            const response = await fetch(`${URL}/db/${db}/files/${file._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(file)
            })
            const data = await response.json()
            return data
        },

        getFrame: async (fileid, f) => {
            const response = await fetch(`${URL}/db/${db}/data/?id=${fileid}&f=${f}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const blob = await response.blob()
            return blob
        },

        getPatients: async () => {
            const response = await fetch(`${URL}/db/${db}/patients`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            return data
        },
        
        getPatient: async (id) => {
            const response = await fetch(`${URL}/db/${db}/patients/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            return data
        },

        getSerie: async (id) => {
            const response = await fetch(`${URL}/db/${db}/series/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            return data
        },

        getTags: async () => {
            const response = await fetch(`${URL}/db/${db}/tags`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            return data
        },

        addTag: async (tag) => {
            const response = await fetch(`${URL}/db/${db}/tags`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(tag)
            })
            const data = await response.json()
            return data
        },

        updateTag: async (tag) => {
            const response = await fetch(`${URL}/db/${db}/tags/${tag._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(tag)
            })
            const data = await response.json()
            return data
        },

        addSeriesTag: async (id, tag) => {
            const response = await fetch(`${URL}/db/${db}/series/${id}/tags`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tag)
            })
            const data = await response.json()
            return { 'status': response.status, 'result': data }
        },

        updateSeriesTag: async (id, i, tag) => {
            const response = await fetch(`${URL}/db/${db}/series/${id}/tags/${i}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tag)
            })
            const data = await response.json()
            return { 'status': response.status, 'result': data }
        },

        deleteSeriesTag: async (id, { x, y, f, k } = {}) => {
            let url = `${URL}/db/${db}/series/${id}/tags?`
            if (x !== undefined) url += `x=${x}&`
            if (y !== undefined) url += `y=${y}&`
            if (f !== undefined) url += `f=${f}&`
            if (k !== undefined) url += `k=${k}&`
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json()
            return { 'status': response.status, 'result': data }
        }
    }

    return api;
}


export const APIContext = React.createContext({
    api: createAPI({token: null, db: null}),
    updateAPI: () => {},
})