import isArray from './util/isArray';
import { ModuleInfo, FinalModuleInfo } from './interface';

type Module = string | string[] | ModuleInfo;

let _config: {
    timeout?: number;
    baseUrl?: string;
    modules?: {
        [module: string]: Module;
    };
    loaders?: {
        [type: string]: unknown;
    };
} = {};

const absolutePath = /^(http(s)?:)?\/\//;

const isFiles = (module): module is string[] => {
    return isArray(module);
};

const string2Array = (str: string | string[] = []): string[] => {
    return typeof str === 'string' ? [str] : str;
};

export const moduleInfoResolver = (module: Module): FinalModuleInfo => {
    if (!module) return;
    const { modules = {}, baseUrl = '' } = _config;
    let moduleInfo: Module = module;
    if (typeof module === 'string' && module in modules) {
        moduleInfo = modules[module];
    }
    if (typeof moduleInfo === 'string' || isFiles(moduleInfo)) {
        moduleInfo = {
            js: moduleInfo,
            type: 'immediate'
        };
    }
    const { js, css, dep } = moduleInfo;
    moduleInfo.js = string2Array(js).map(file => (absolutePath.test(file) ? file : baseUrl + file));
    moduleInfo.css = string2Array(css).map(file => (absolutePath.test(file) ? file : baseUrl + file));
    moduleInfo.dep = string2Array(dep);
    return moduleInfo as FinalModuleInfo;
};

const moduleResolveMap: {
    [key: string]: FinalModuleInfo;
} = {};
export const stringModuleResolve = (module: string): FinalModuleInfo => {
    if (moduleResolveMap.hasOwnProperty(module)) {
        return moduleResolveMap[module];
    }
    const moduleInfo = moduleInfoResolver(module);
    return (moduleResolveMap[module] = moduleInfo);
};

export const getLoader = (type: string) => {
    const { loaders = {} } = _config;
    return loaders[type];
};

const config = (config = {}) => {
    _config = {
        ..._config,
        ...config
    };
};

export const getTimeout = () => _config.timeout;

export default config;
