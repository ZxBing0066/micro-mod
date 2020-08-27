import { moduleResolve } from '../src/config';
import { FinalModuleInfo, AnyFunction } from '../src/interface';
import { load as loadScript } from '../src/loader/scriptLoaderPromise';
import { load as loadStyle } from '../src/loader/styleLoader';
import promiseOnce from '../src/util/promiseOnce';
import pendingFactory from '../src/util/pendingFactory';

const moduleResolveMap: {
    [key: string]: FinalModuleInfo;
} = {};

const moduleMap: {
    [key: string]: unknown;
} = {};

const moduleResolveWithCache = moduleName => {
    if (moduleName in moduleResolveMap) {
        return moduleResolveMap[moduleName];
    } else {
        return (moduleResolveMap[moduleName] = moduleResolve(moduleName));
    }
};

const moduleIsDefined = (moduleName: string): boolean => moduleMap.hasOwnProperty(moduleName);
const getModule = (moduleName: string): unknown => moduleMap[moduleName];
const setModule = (moduleName: string, module: unknown) => (moduleMap[moduleName] = module);

const loadModule = promiseOnce(async module => {
    if (!module) return;
    const moduleInfo = moduleResolveWithCache(module);
    if (!moduleInfo) return;

    const { js = [], css = [], dep = [] } = moduleInfo;

    const depsLoad = dep.map(dep => loadModule(dep));
    const jsLoad = js.map(f => loadScript(f));
    const cssLoad = css.map(f => loadStyle(f));
    return await Promise.all([...depsLoad, ...jsLoad, ...cssLoad]);
});

let jobs: AnyFunction[] = [];

const checkModulesReady = (modules: string[]) => {
    const l = modules.length;
    let missingModule = false;
    for (let i = 0; i < l; i++) {
        const module = modules[i];
        if (!moduleIsDefined(module)) {
            missingModule = true;
            break;
        }
    }
    return !missingModule;
};

const checkJob = (modules: string[], resolve: AnyFunction) => () => {
    if (checkModulesReady(modules)) {
        resolve();
        return true;
    }
    return false;
};

const checkModules = async (modules: string[]) => {
    if (!checkModulesReady(modules)) {
        const [pending, ready] = pendingFactory();
        const job = checkJob(modules, ready);
        jobs.push(job);
        await pending;
    }
};

const runJobs = () => {
    jobs.forEach((job, i) => {
        if (job()) {
            jobs[i] = null;
        }
    });
    jobs = jobs.filter(job => job != null);
};

const _import = async (modules: string | string[] = []): Promise<unknown | unknown[]> => {
    let isSingle = false;
    if (typeof modules === 'string') {
        modules = [modules];
        isSingle = true;
    }
    await Promise.all(modules.map(loadModule));
    await checkModules(modules);
    return isSingle ? getModule(modules[0]) : modules.map(getModule);
};

const _export = (moduleName: string, module: any) => {
    if (moduleIsDefined(moduleName)) {
        console.error(`Warning: Module ${moduleName} already existed, you can't export duplicated`);
    } else {
        setModule(moduleName, module);
    }
    runJobs();
};

// const importModuleFromFiles = async (moduleName: string, moduleInfo: ModuleInfo) => {
//     const { baseUrl = '', moduleMap = {} } = moduleConfig;
//     if (moduleName in moduleMap) {
//         console.error(`Error: Module ${moduleName} already existed in moduleMap`);
//         return;
//     }
//     await loadModule(moduleInfo, baseUrl);
//     await checkModules([moduleName]);
//     return getModule(moduleName);
// };

export { _import as import, _export as export, moduleIsDefined, getModule, setModule };
