import { load } from '../src/loader/scriptLoaderPromise';
import isArray from '../src/util/isArray';
import noop from '../src/util/noop';
import { moduleIsDefined as _moduleIsDefined, getModule as _getModule, setModule as _setModule } from '../src/mod';

const modulePlaceholder = {};
const exportsPlaceholder = {};

const STATE = {
    // module file is loading
    loading: 1,
    // module file loaded
    loaded: 2,
    // module pending for load dependences
    pending: 3,
    // module dependences ready, module is ready
    ready: 4,
    // module defined, factory executed
    defined: 5
};
const stateMap = {};
const defineQueue = [];
const moduleQueueMap = {};

const getModule = (moduleName: string): unknown => {
    return moduleName === 'module'
        ? modulePlaceholder
        : moduleName === 'exports'
        ? exportsPlaceholder
        : moduleName === 'require'
        ? _require
        : _getModule(moduleName);
};
const setModule = (moduleName: string, module: unknown) => {
    _setModule(moduleName, module);
};

const _require = dependence => {
    return getModule(dependence);
};

const REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;
const SLASH_RE = /\\\\/g;

const parseDependencies = code => {
    const deps = [];
    code.replace(SLASH_RE, '').replace(REQUIRE_RE, function (m, m1, m2) {
        console.log(m, m1, m2);
        if (m2) {
            deps.push(m2);
        }
    });
    return deps;
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
            deps = await cmdLoad(moduleInfo[1]);
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

const cmdLoad = async (modules): Promise<any[]> => {
    return await Promise.all(modules.map(moduleLoad));
};

const moduleLoad = async moduleName => {
    if (_moduleIsDefined(moduleName)) {
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

const define = function define(id, deps, factory) {
    if (typeof id !== 'string') {
        factory = deps;
        deps = id;
        id = null;
    }
    if (!isArray(deps)) {
        factory = deps;
        deps = null;
    }
    if (typeof factory === 'function') {
        deps = parseDependencies(factory.toString());
    }
    defineQueue.push([id, deps, factory]);
    deps && deps.map(moduleLoad);
};
define.cmd = {};

export { define };
