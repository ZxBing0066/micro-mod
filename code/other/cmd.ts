import { load } from '../loader/scriptLoaderPromise';

let _config = {};

const config = config => {
    _config = config;
};

const moduleMap = {};
const stateMap = {};
const defineQueue = [];
const moduleQueueMap = {};
const State = {
    // 加载
    loading: 1,
    // 加载完成
    loaded: 2,
    // 等待依赖加载
    pending: 3,
    // 依赖加载完成
    ready: 4,
    // 执行完成
    executed: 5
};

const isArray = arr => ({}.toString.call(arr) === '[object Array]');

var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;
var SLASH_RE = /\\\\/g;

function parseDependencies(code) {
    var ret = [];
    code.replace(SLASH_RE, '').replace(REQUIRE_RE, function (m, m1, m2) {
        if (m2) {
            ret.push(m2);
        }
    });
    return ret;
}

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
        if (moduleInfo[1]?.length) {
            await cmdLoad(moduleInfo[1]);
        }
        stateMap[module] = 4;
        moduleMap[module] = moduleInfo[2];
    }
};

const cmdLoad = async (modules): Promise<void> => {
    await Promise.all(modules.map(moduleLoad));
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

const _require = function (id) {
    if (stateMap[id] === 4) {
        if (typeof moduleMap[id] === 'function') {
            let module = {
                exports: {}
            };
            const result = moduleMap[id](_require, module.exports, module);
            if (result != null) {
                module = {
                    exports: result
                };
            }
            stateMap[id] = 5;
            moduleMap[id] = module;
        } else {
            stateMap[id] = 5;
        }
    } else if (stateMap[id] === 5) {
        return moduleMap[id];
    }
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

    if (typeof callback === 'function' && !deps) {
        deps = parseDependencies(callback.toString());
    }

    deps && deps.map(load);
};

define.cmd = {};

export { define, _require as require, config };
