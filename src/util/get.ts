const get = (src: string, header?: Record<string, string>): Promise<XMLHttpRequest> => {
    return new Promise((resolve, reject) => {
        const oReq = new XMLHttpRequest();
        oReq.addEventListener('load', e => {
            if (oReq.status >= 200 && oReq.status < 300) {
                resolve(oReq);
            } else {
                reject(new Error('Request failed with status code ' + oReq.status));
            }
        });
        oReq.addEventListener('abort', e => {
            reject(e);
        });
        oReq.addEventListener('error', e => {
            reject(e);
        });
        oReq.addEventListener('timeout', e => {
            reject(e);
        });
        oReq.open('GET', src);
        if (header) {
            Object.keys(header).forEach(key => {
                oReq.setRequestHeader(key, header[key]);
            });
        }
        oReq.send();
    });
};

export default get;
