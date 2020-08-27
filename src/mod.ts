import { stringModuleResolve } from './config';
import { load as loadScript } from './loader/scriptLoaderPromise';
import { load as loadCSS } from './loader/cssLoader';
import promiseOnce from './util/promiseOnce';
import {
    getExports as getModuleExports,
    update as updateModule,
    register as registerModule,
    defined as moduleDefined,
    wait as waitModule
} from './module';

const moduleResolverMap = {};
export const registerModuleResolver = (type, resolver) => {
    moduleResolverMap[type] = resolver;
};

const loadModule = promiseOnce(async module => {
    if (!module) return;
    const moduleInfo = stringModuleResolve(module);
    if (!moduleInfo) return;

    if (moduleInfo.type) {
        let type = moduleInfo.type,
            options;
        if (typeof type !== 'string') {
            [type, options] = type;
        }
        if (moduleResolverMap[type]) {
            return await moduleResolverMap[type](module, options);
        }
    }

    try {
        registerModule(module);
    } catch (error) {
        return;
    }
    const { js = [], css = [], dep = [] } = moduleInfo;
    const jsLoad = js.map(f => loadScript(f));
    const cssLoad = css.map(f => loadCSS(f));
    const depsLoad = dep.map(dep => loadModule(dep));
    return await Promise.all([...jsLoad, ...cssLoad, ...depsLoad]);
});

const _import = async (modules: string | string[] = []): Promise<unknown | unknown[]> => {
    let isSingle = false;
    if (typeof modules === 'string') {
        modules = [modules];
        isSingle = true;
    }
    await Promise.all(modules.map(loadModule));
    await Promise.all(modules.map(module => waitModule(module, 6)));
    return isSingle ? getModuleExports(modules[0]) : modules.map(getModuleExports);
};

const _export = (moduleName: string, module: any) => {
    if (moduleDefined(moduleName)) {
        console.error(`Warning: Module ${moduleName} already existed, you can't export duplicated`);
    } else {
        updateModule(moduleName, 6, { exports: module });
    }
};

export { _import as import, _export as export };
