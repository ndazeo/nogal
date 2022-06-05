const URL = process.env.REACT_APP_API_URL


const login = async (user) => {
    const response = await fetch(`${URL}auth/login`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': user
        }
    })
    if(response.status===200)
        return await response.text()
    else
        return null
}

const apiFetch = (token, setToken) => async (url, params) => {
    const response = await fetch(`${url}`, params)
    if ( response.status === 401) setToken(null)
    return response
}
    

const useAPI = (props) => {
    if(!props) return
    const [token, setToken] = props.token
    
    const fetch = apiFetch(token, setToken);

    return {
        token: token,
        URL: URL,

        getUser : async () => {
            const response = await fetch(`${URL}auth/user`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const user = await response.json()
            return user
        },

        getFrame: async (fileid, f) => {
            const response = await fetch(`${URL}data/?id=${fileid}&f=${f}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const blob = await response.blob()
            return blob
        },
    getPatients: async () => {
            const response = await fetch(`${URL}patients`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            return data
        },
    getPatient: async (id) => {
            const response = await fetch(`${URL}patients/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            return data
        },
    getSerie: async (id) => {
            const response = await fetch(`${URL}series/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            return data
        },
    getTags: async () => {
            const response = await fetch(`${URL}tags`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            return data
        },
    addTag: async (id, tag) => {
            const response = await fetch(`${URL}series/${id}/tags`, {
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
    updateTag: async (id, i, tag) => {
            const response = await fetch(`${URL}series/${id}/tags/${i}`, {
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
    deleteTag: async (id, {x, y, f, k} = {}) => {
            let url = `${URL}series/${id}/tags?`
            if(x!==undefined) url += `x=${x}&`
            if(y!==undefined) url += `y=${y}&`
            if(f!==undefined) url += `f=${f}&`
            if(k!==undefined) url += `k=${k}&`
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
}


export { login, useAPI }