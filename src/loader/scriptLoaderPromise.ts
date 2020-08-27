import { load as _load } from './scriptLoader';

export const load = path => {
    return new Promise((resolve, reject) => {
        _load(path, event => {
            if (event.type === 'error') {
                reject(event);
            } else {
                resolve(event);
            }
        });
    });
};
