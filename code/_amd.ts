import { load } from '../src/loader/scriptLoaderPromise';
import isArray from '../src/util/isArray';
import noop from '../src/util/noop';
import { moduleIsDefined as _moduleIsDefined, getModule as _getModule, setModule as _setModule } from '../src/mod';

const modulePlaceholder = {};
const exportsPlaceholder = {};

const stateMap = {};
const defineQueue = [];
const moduleQueueMap = {};

const moduleIsDefined = (moduleName: string): boolean => {
    return moduleName === 'module' || moduleName === 'exports' || _moduleIsDefined(moduleName);
};
const getModule = (moduleName: string): unknown => {
    return moduleName === 'module'
        ? modulePlaceholder
        : moduleName === 'exports'
        ? exportsPlaceholder
        : _getModule(moduleName);
};
const setModule = (moduleName: string, module: unknown) => {
    _setModule(moduleName, module);
};

const _require = async (dependences, callback = noop) => {
    const modules = await amdLoad(dependences);
    callback(...modules);
    return modules;
};

const runDefineQueue = async (module, noWarn?) => {
    if (!defineQueue.length) {
        !noWarn && console.warn(`Can't find define for module ${module}, you may forget to use define`);
        stateMap[module] = 4;
        setModule(module, undefined);
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
            setModule(module, result ? result : _module.exports);
        } else {
            setModule(module, moduleInfo[2]);
        }
    }
};

const amdLoad = async (modules): Promise<any[]> => {
    return await Promise.all(modules.map(moduleLoad));
};

const moduleLoad = async moduleName => {
    if (moduleIsDefined(moduleName)) {
        return getModule(moduleName);
    }
    if (stateMap.hasOwnProperty(moduleName)) {
        let ready;
        const pending = new Promise(resolve => {
            ready = resolve;
        });
        if (!moduleQueueMap[moduleName]) {
            moduleQueueMap[moduleName] = [];
        }
        moduleQueueMap[moduleName].push(ready);
        return await pending;
    }
    stateMap[moduleName] = 1;
    await load(moduleName);
    stateMap[moduleName] = 2;
    await runDefineQueue(moduleName);
    const module = getModule(moduleName);
    if (moduleQueueMap[moduleName]) {
        moduleQueueMap[moduleName].forEach(ready => {
            ready(module);
        });
    }
    return module;
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
