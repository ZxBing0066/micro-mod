import { load as _load } from './scriptLoader';
import promiseOnce from '../util/promiseOnce';

export const load = promiseOnce(path => {
    return new Promise((resolve, reject) => {
        _load(path, event => {
            if (event.type === 'error') {
                reject(event);
            } else {
                resolve(event);
            }
        });
    });
});
