import { load } from '../loader/scriptLoaderPromise';
import isArray from '../util/isArray';
import promiseOnce from '../util/promiseOnce';

const specialDepMap = {
    require: 1,
    module: 1,
    exports: 1
};

export default ({ module, config, register, import: _import }) => {
    const { moduleInfoResolver } = config;
    const {
        register: registerModule,
        update: updateModule,
        getState: getModuleState,
        getExports: getModuleExports,
        wait: waitModule
    } = module;

    const defineQueue = [];
    const _define = (id, deps, factory) => {
        if (typeof id !== 'string') {
            factory = deps;
            deps = id;
            id = null;
        }
        if (!isArray(deps)) {
            factory = deps;
            deps = null;
        }
        defineQueue.push([id, deps, factory]);
    };
    _define.amd = {};

    const pickDefineQueue = moduleName => {
        let anonymousModule;
        while (defineQueue.length) {
            const [id, deps, factory] = defineQueue.shift();
            if (!id) {
                if (!anonymousModule) {
                    anonymousModule = {
                        id: moduleName,
                        deps,
                        factory
                    };
                } else {
                    console.error('Warning: Mismatch anonymous define module ---', factory);
                }
            }
        }
        return anonymousModule;
    };

    const innerRequire = moduleName => defineModule(moduleName);

    const defineModule = moduleName => {
        const moduleState = getModuleState(moduleName);
        let { status, deps = [], factory } = moduleState;
        switch (status) {
            case 5: {
                let module = {
                    exports: {}
                };
                let exports = module.exports;
                if (typeof factory === 'function') {
                    deps = deps.map(dep => {
                        switch (dep) {
                            case 'define':
                                return innerRequire;
                            case 'exports':
                                return exports;
                            case 'module':
                                return module;
                            default:
                                return defineModule(dep);
                        }
                    });
                    const result = factory(...deps, innerRequire, exports, module);
                    if (result) {
                        exports = result;
                    }
                } else {
                    exports = factory;
                }
                updateModule(moduleName, 6, { exports });
            }
            default:
                return getModuleExports(moduleName);
        }
    };

    const REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;
    const SLASH_RE = /\\\\/g;

    function parseDependencies(code) {
        const deps = [];
        code.replace(SLASH_RE, '').replace(REQUIRE_RE, function (m, m1, m2) {
            if (m2) {
                deps.push(m2);
            }
        });
        return deps;
    }

    const resolver = promiseOnce(async moduleName => {
        try {
            registerModule(moduleName);
        } catch (e) {
            await waitModule(moduleName, 6);
        }
        try {
            const moduleInfo = moduleInfoResolver(moduleName);
            const { js } = moduleInfo;
            const script = js?.[0];
            if (!script) {
                throw new Error(`There is no file for module: ${moduleName}`);
            }
            await load(script);
            updateModule(moduleName, 2);
            let { deps, factory } = pickDefineQueue(moduleName);
            updateModule(moduleName, 3);
            let depPending;
            if (!deps?.length) {
                deps = typeof factory === 'function' ? parseDependencies(factory.toString()) : [];
            }
            depPending = Promise.all(deps.filter(dep => !specialDepMap.hasOwnProperty(dep)).map(dep => _import(dep)));
            updateModule(moduleName, 4);
            await depPending;
            updateModule(moduleName, 5, { factory, deps });
            defineModule(moduleName);
        } catch (error) {
            updateModule(moduleName, 7, { error });
            console.error(error);
        }
    });

    (window as any).define = _define;
    register('amd', resolver);
};
