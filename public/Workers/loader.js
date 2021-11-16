methods = {
        'getFrame': async (URL, token, fileid, f) => {
        const response = await fetch(`${URL}data/?id=${fileid}&f=${f}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const blob = await response.blob()
        return blob
    }
}

var requests = [];
var listener = null;

var getRequest = () => {
    return new Promise((resolve, reject) => {
        if(requests.length > 0){
            resolve(requests.shift());
        }            
        else{
            listener = resolve
        }
    })
}

self.addEventListener("message", (msg) => {
    requests = msg.data
    if(listener){
        listener(requests.shift());
        listener = null;
    }
})

async function loop(){
    while(1){
        const request = await getRequest();
        const {method, params} = request;
        let result = await methods[method](...params);
        result = await result.arrayBuffer();
        const response = {...request.ret, result};
        self.postMessage(response, []);    
    }
}

loop();