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
export const getError = id => moduleStateMap[id]?.error;

const defaultModuleError = new Error('Module export error');

export const update = (id, status, data?) => {
    const moduleStatus = getStatus(id);
    if (moduleStatus >= 6) {
        return;
    }
    let moduleState = getState(id);
    if (!moduleState) {
        moduleState = register(id);
    }

    Object.assign(moduleState, { status }, data);
    if (status === 6) {
        moduleMap[id] = moduleState.exports;
        Object.defineProperty(moduleMap, id, {
            writable: false,
            configurable: false
        });
    } else if (status === 7 && !moduleState.error) {
        moduleState.error = defaultModuleError;
    }

    const pendingQueue = pendingMap[id];
    if (pendingQueue) {
        new Array(status).fill(null).forEach((v, i) => {
            const _status = i + 1;
            pendingQueue[_status]?.forEach(job => status === 7 ? job.error(moduleState.error) : job.ready());
            delete pendingQueue[_status];
        });
    }
};

export const wait = async (id, status, timeout?: number) => {
    const currentStatus = getStatus(id);
    if (currentStatus == 7) throw getError(id);
    if (currentStatus >= status) {
        return;
    }
    if (!pendingMap[id]) pendingMap[id] = {};
    if (!pendingMap[id][status]) pendingMap[id][status] = [];
    const [pending, ready, error] = pendingFactory();
    const job = { ready, error };
    pendingMap[id][status].push(job);
    let timeoutTimer;
    if (timeout) {
        timeoutTimer = setTimeout(() => {
            pendingMap[id][status] = pendingMap[id][status].filter(_job => _job !== job);
            error(new Error(`Wait for module ${id} timeout`));
        }, timeout);
    }
    try {
        await pending;
    } catch (e) {
        throw e;
    } finally {
        if (timeoutTimer) {
            clearTimeout(timeoutTimer);
        }
    }
};
