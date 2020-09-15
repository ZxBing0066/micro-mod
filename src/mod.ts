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

    if (moduleInfo.type && moduleInfo.type !== 'immediate') {
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
    const moduleLoad = async () => {
        const jsLoad = js.map(f => loadScript(f));
        const cssLoad = css.map(f => loadCSS(f));
        await Promise.all([...jsLoad, ...cssLoad]);
        updateModule(module, 2);
    };
    const depLoad = async () => {
        const depLoad = dep.map(dep => loadModule(dep));
        await Promise.all(depLoad);
    };
    await Promise.all([moduleLoad(), depLoad()]);
    updateModule(module, 5);
    return moduleInfo;
});

const _import = async (modules: string | string[] = []): Promise<unknown | unknown[]> => {
    let isSingle = false;
    if (typeof modules === 'string') {
        modules = [modules];
        isSingle = true;
    }
    const moduleInfos = await Promise.all(modules.map(loadModule));
    await Promise.all(
        moduleInfos.map((moduleInfo, i) =>
            moduleInfo.type === 'immediate' ? waitModule(modules[i], 2) : waitModule(modules[i], 6)
        )
    );
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
