import isArray from './util/isArray';
import memo from './util/memo';
import { ModuleInfo, FinalModuleInfo } from './interface';

type Module = string | string[] | ModuleInfo;

interface Config {
    timeout?: number;
    baseUrl?: string;
    modules?: {
        [module: string]: Module;
    };
}

let _config: Config = {
    timeout: 5000
};

const absolutePath = /^(http(s)?:)?\/\//;

const isFiles = (module): module is string[] => {
    return isArray(module);
};

const string2Array = (str: string | string[] = []): string[] => {
    return typeof str === 'string' ? [str] : str;
};

const resolveModule = (module: Module): ModuleInfo => {
    if (typeof module === 'string') {
        return {
            js: [module]
        };
    } else if (isFiles(module)) {
        return {
            js: module
        };
    } else {
        return module;
    }
};

export const moduleInfoResolver = memo(
    (module: Module): FinalModuleInfo => {
        if (!module) return;
        const { modules = {}, baseUrl = '' } = _config;
        let moduleInfo: ModuleInfo;
        if (typeof module === 'string') {
            if (modules.hasOwnProperty(module)) {
                moduleInfo = resolveModule(modules[module]);
            } else {
                moduleInfo = {
                    js: [module],
                    type: 'immediate'
                };
            }
            moduleInfo.key = module;
        } else if (isFiles(moduleInfo)) {
            moduleInfo = {
                key: moduleInfo.join('|'),
                js: moduleInfo,
                type: 'immediate'
            };
        } else {
            moduleInfo = {
                ...module,
                type: 'immediate'
            };
        }
        const { js, css, dep } = moduleInfo as ModuleInfo;
        moduleInfo.js = string2Array(js).map(file => (absolutePath.test(file) ? file : baseUrl + file));
        moduleInfo.css = string2Array(css).map(file => (absolutePath.test(file) ? file : baseUrl + file));
        moduleInfo.dep = string2Array(dep);
        return moduleInfo as FinalModuleInfo;
    }
);

const config = (config: Config = {}) => {
    _config = {
        ..._config,
        ...config,
        modules: {
            ..._config.modules,
            ...config.modules
        }
    };
};

export const getTimeout = () => _config.timeout;

export default config;
