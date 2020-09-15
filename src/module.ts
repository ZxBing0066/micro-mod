/**
 * module status
 * loading: 1
 * loaded: 2
 * merged: 3
 * pending: 4
 * ready: 5
 * defined: 6
 * error: 7
 */
import pendingFactory from './util/pendingFactory';

const moduleMap = {};
const pendingMap = {};

export const register = id => {
    if (moduleMap.hasOwnProperty(id)) {
        throw new Error(`Module: ${id} existed`);
    }
    const moduleState = {
        status: 1,
        deps: [],
        factory: null,
        error: null,
        exports: undefined
    };
    return (moduleMap[id] = moduleState);
};

export const getState = id => moduleMap[id];
export const getExports = id => moduleMap[id]?.exports;
export const exist = id => moduleMap.hasOwnProperty(id);
export const defined = id => moduleMap[id]?.status >= 6;
export const getStatus = id => moduleMap[id]?.status;

export const update = (id, status, data?) => {
    const moduleStatus = getStatus(id);
    if (moduleStatus >= 6) {
        return;
    }
    const moduleState = getState(id);
    Object.assign(moduleState, { status }, data);
    const pendingQueue = pendingMap[id];
    if (pendingQueue) {
        new Array(status).fill(null).forEach((v, i) => {
            const status = i + 1;
            pendingQueue[status]?.forEach(job => job());
            delete pendingQueue[status];
        });
    }
};

export const wait = async (id, status) => {
    if (getStatus(id) >= status) {
        return;
    }
    if (!pendingMap[id]) pendingMap[id] = {};
    if (!pendingMap[id][status]) pendingMap[id][status] = [];
    const [pending, ready] = pendingFactory();
    pendingMap[id][status].push(ready);
    await pending;
};
