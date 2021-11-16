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
        console.log("loader: query requests")
        if(requests.length > 0){
            console.log("loader: return from array")
            resolve(requests.shift());
        }            
        else{
            listener = resolve
            console.log("loader: wait for request")
        }
    })
}

self.addEventListener("message", (msg) => {
    console.log(`loader: received message ${JSON.stringify(msg.data[0].ret)}`)
    requests = msg.data
    if(listener)
        listener(requests.shift());
})

async function loop(){
    while(1){
        const request = await getRequest();
        console.log("loader: processing request")
        const {method, params} = request;
        console.log(`loader: loading ${JSON.stringify(request.ret)}`)
        let result = await methods[method](...params);
        result = await result.arrayBuffer();
        const response = {...request.ret, result};
        self.postMessage(response, []);    
    }
}

loop();