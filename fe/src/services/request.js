
var firstUrl = 'http://localhost:8080'
async function uploadSingleFile(filePath) {
    const formData = new FormData()
    formData.append("file", filePath.files[0])
    var urlUpload = firstUrl+'/api/public/upload-file';
    const res = await fetch(urlUpload, {
        method: 'POST',
        body: formData
    });
    if (res.status < 300) {
        var linkImage = await res.text();
        return linkImage;
    }
    else{
        return null;
    }
}

function urlGlobal(){
    return firstUrl;
}

async function uploadMultipleFile(listFile) {
    const formData = new FormData()
    for (var i = 0; i < listFile.length; i++) {
        formData.append("file", listFile[i])
    }
    var urlUpload = firstUrl+'/api/public/upload-multiple-file';
    const res = await fetch(urlUpload, {
        method: 'POST',
        body: formData
    });
    if (res.status < 300) {
        return await res.json();
    } else {
        return [];
    }
}

var token = localStorage.getItem("token");
async function getMethod(url) {
    if(url.includes(firstUrl) == false){
        url = firstUrl + url;
    }
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    return response
}

async function postMethod(url) {
    if(url.includes(firstUrl) == false){
        url = firstUrl + url;
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    return response
}

async function postMethodTextPlan(url, payload) {
    if(url.includes(firstUrl) == false){
        url = firstUrl + url;
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'text/plain'
        }),
        body: payload
    });
    return response
}

async function postMethodPayload(url, payload) {
    if(url.includes(firstUrl) == false){
        url = firstUrl + url;
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(payload)
    });
    return response
}

async function deleteMethod(url) {
    if(url.includes(firstUrl) == false){
        url = firstUrl + url;
    }
    const response = await fetch(url, {
        method: 'DELETE',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    return response
}



export {getMethod,postMethod, uploadSingleFile,uploadMultipleFile,postMethodPayload,deleteMethod,postMethodTextPlan,urlGlobal}