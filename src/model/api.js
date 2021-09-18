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

export {getFrame}