import { load } from '../../src/loader/scriptLoaderPromise';
import isArray from '../../src/util/isArray';
import noop from '../../src/util/noop';

const modulePlaceholder = {};
const exportsPlaceholder = {};

const moduleMap = {
    module: modulePlaceholder,
    exports: exportsPlaceholder
};
const stateMap = {};
const defineQueue = [];
const moduleQueueMap = {};

const _require = async (dependences, callback = noop) => {
    const modules = await amdLoad(dependences);
    callback(...modules);
    return modules;
};

const runDefineQueue = async (module, noWarn?) => {
    if (!defineQueue.length) {
        !noWarn && console.warn(`Can't find define for module ${module}, you may forget to use define`);
        stateMap[module] = 4;
        moduleMap[module] = undefined;
        return;
    }
    const moduleInfo = defineQueue.shift();
    if (moduleInfo[0]) {
        await runDefineQueue(module, true);
    } else {
        stateMap[module] = 3;
        const _module = {
            exports: {}
        };
        let deps = [];
        if (moduleInfo[1]?.length) {
            deps = await amdLoad(moduleInfo[1]);
        }
        stateMap[module] = 4;
        deps = deps.map(dep => {
            if (dep === modulePlaceholder) {
                return _module;
            } else if (dep === exportsPlaceholder) {
                return _module.exports;
            } else {
                return dep;
            }
        });
        if (typeof moduleInfo[2] === 'function') {
            const result = moduleInfo[2](...deps);
            moduleMap[module] = result ? result : _module.exports;
        } else {
            moduleMap[module] = moduleInfo[2];
        }
    }
};

const amdLoad = async (modules): Promise<any[]> => {
    return await Promise.all(modules.map(moduleLoad));
};

const moduleLoad = async module => {
    if (module in moduleMap) {
        return moduleMap[module];
    }
    if (module in stateMap) {
        let ready;
        const pending = new Promise(resolve => {
            ready = resolve;
        });
        if (!moduleQueueMap[module]) {
            moduleQueueMap[module] = [];
        }
        moduleQueueMap[module].push(ready);
        return await pending;
    }
    stateMap[module] = 1;
    await load(module);
    stateMap[module] = 2;
    await runDefineQueue(module);
    if (moduleQueueMap[module]) {
        moduleQueueMap[module].forEach(ready => {
            ready(moduleMap[module]);
        });
    }
    return moduleMap[module];
};

const define = function define(id, deps, callback) {
    if (typeof id !== 'string') {
        callback = deps;
        deps = id;
        id = null;
    }
    if (!isArray(deps)) {
        callback = deps;
        deps = null;
    }
    defineQueue.push([id, deps, callback]);
    deps && deps.map(moduleLoad);
};
define.amd = {};

export { define, _require as require };
