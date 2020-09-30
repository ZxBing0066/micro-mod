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

const moduleStateMap = {};
const pendingMap = {};

export const moduleMap = {};

export const register = id => {
    if (moduleStateMap.hasOwnProperty(id)) {
        throw new Error(`Module: ${id} existed`);
    }
    const moduleState = {
        status: 1,
        deps: [],
        factory: null,
        error: null,
        exports: undefined
    };
    return (moduleStateMap[id] = moduleState);
};

export const getState = id => moduleStateMap[id];
export const getExports = id => moduleMap[id];
export const exist = id => moduleStateMap.hasOwnProperty(id);
export const defined = id => moduleStateMap[id]?.status >= 6;
export const getStatus = id => moduleStateMap[id]?.status;

export const update = (id, status, data?) => {
    const moduleStatus = getStatus(id);
    if (moduleStatus >= 6) {
        return;
    }
    const moduleState = getState(id);
    Object.assign(moduleState, { status }, data);
    if (moduleState.status === 6) {
        moduleMap[id] = moduleState.exports;
        Object.defineProperty(moduleMap, id, {
            writable: false,
            configurable: false
        });
    }
    const pendingQueue = pendingMap[id];
    if (pendingQueue) {
        new Array(status).fill(null).forEach((v, i) => {
            const status = i + 1;
            pendingQueue[status]?.forEach(job => job());
            delete pendingQueue[status];
        });
    }
};

export const wait = async (id, status, timeout?: number) => {
    if (getStatus(id) >= status) {
        return;
    }
    if (!pendingMap[id]) pendingMap[id] = {};
    if (!pendingMap[id][status]) pendingMap[id][status] = [];
    const [pending, ready, error] = pendingFactory();
    pendingMap[id][status].push(ready);
    let timeoutTimer;
    if (timeout) {
        timeoutTimer = setTimeout(() => {
            pendingMap[id][status] = pendingMap[id][status].filter(job => job !== ready);
            error(new Error(`Wait for module ${id} timeout`));
        }, timeout);
    }
    await pending;
    if (timeoutTimer) {
        clearTimeout(timeoutTimer);
    }
};
