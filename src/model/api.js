const URL = 'http://192.168.0.7:5000/ANKloud/api/'

const jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbmtsb3VkLmF6b3VzLmNvbS5hciIsImlhdCI6MTYzMTg4MzU4NCwiZXhwIjoxNjM0NDc1NTg0LCJzdWIiOjEsInNjb3BlIjoiIn0.ZNOyFA5WIkq49742IrmPQH3uZErepdyjcm80a4687eI'

const getFrame = async(fileid,f) => {
    const response = await fetch(`${URL}data/?id=${fileid}&f=${f}`,{
        method: 'GET',
        headers: {
        'Authorization': `Bearer ${jwt}`
        }
    })
    const blob = await response.blob()
    return blob
}

const getPatients = async() => {
    const response = await fetch(`${URL}patients`,{
        method: 'GET',
        headers: {
        'Authorization': `Bearer ${jwt}`
        }
    })
    const data = await response.json()
    return data
}

const getPatient = async(id) => {
    const response = await fetch(`${URL}patients/${id}`,{
        method: 'GET',
        headers: {
        'Authorization': `Bearer ${jwt}`
        }
    })
    const data = await response.json()
    return data
}

const getSerie = async(id) => {
    const response = await fetch(`${URL}series/${id}`,{
        method: 'GET',
        headers: {
        'Authorization': `Bearer ${jwt}`
        }
    })
    const data = await response.json()
    return data
}

const getTags = async() => {
    const response = await fetch(`${URL}tags`,{
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${jwt}`
            }
        })
        const data = await response.json()
        return data
}

const addTag = async(id,tag) => {
    const response = await fetch(`${URL}series/${id}/tags`,{
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tag)
    })
    const data = await response.json()
    return {'status': response.status, 'serie': data}
}

const updateTag = async(id,i, tag) => {
    const response = await fetch(`${URL}series/${id}/tags/${i}`,{
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tag)
    })
    const data = await response.json()
    return {'status': response.status, 'serie': data}
}

const deleteTag = async(id,x,y,f) => {
    const response = await fetch(`${URL}series/${id}/tags?x=${x}&y=${y}&f=${f}`,{
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json'
        }
    })
    const data = await response.json()
    return {'status': response.status, 'serie': data}
}

export {getFrame, getPatients, getPatient, getSerie, getTags, addTag, updateTag, deleteTag}