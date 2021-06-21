import { getTimeout, moduleInfoResolver } from './config';
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
import * as module from './module';
import * as config from './config';
import { ModuleInfo } from './interface';

const moduleResolverMap = {};

const loadModule = promiseOnce(async (moduleKey, moduleInfo) => {
    if (!moduleInfo) return;

    const isModule = moduleInfo.type !== 'immediate';
    if (moduleInfo.type && isModule) {
        let type = moduleInfo.type,
            options;
        if (typeof type !== 'string') {
            [type, options] = type;
        }
        if (moduleResolverMap[type]) {
            return await moduleResolverMap[type](moduleKey, moduleInfo, options);
        }
    }

    try {
        if (isModule) registerModule(moduleKey);
    } catch (error) {
        return;
    }
    const { js = [], css = [], dep = [], orderExec } = moduleInfo;
    const moduleLoad = async () => {
        const jsLoad = orderExec
            ? (async () => {
                  for (let i = 0; i < js.length; i++) {
                      await loadScript(js[i]);
                  }
              })()
            : js.map(f => loadScript(f));
        const cssLoad = css.map(f => loadCSS(f));
        await Promise.all([...jsLoad, ...cssLoad]);
        if (isModule) updateModule(moduleKey, 2);
    };
    const depLoad = async () => {
        const depLoad = dep.map(_import);
        await Promise.all(depLoad);
    };
    await Promise.all([moduleLoad(), depLoad()]);
    if (isModule) updateModule(moduleKey, 5);
    return moduleInfo;
});

type module = string | ModuleInfo;

const isArrayModules = (modules: module | module[]): modules is module[] =>
    Object.prototype.toString.call(modules) === '[object Array]';

const _import = async (modules: module | module[] = []): Promise<unknown | unknown[]> => {
    let isSingle = false;
    const timeout = getTimeout();
    if (!isArrayModules(modules)) {
        modules = [modules];
        isSingle = true;
    }
    const moduleInfos = modules.map(moduleInfoResolver);
    await Promise.all(moduleInfos.map(moduleInfo => loadModule(moduleInfo.key, moduleInfo)));
    await Promise.all(
        moduleInfos.map((moduleInfo, i) => moduleInfo.type !== 'immediate' && waitModule(moduleInfo.key, 6, timeout))
    );
    return isSingle
        ? getModuleExports(moduleInfos[0].key)
        : moduleInfos.map(moduleInfo => getModuleExports(moduleInfo.key));
};

const _export = (moduleName: string, module: any) => {
    if (moduleDefined(moduleName)) {
        console.error(`Warning: Module ${moduleName} already existed, you can't export duplicated`);
    } else {
        updateModule(moduleName, 6, { exports: module });
    }
};

const _throw = (moduleName: string, error: any) => {
    if (moduleDefined(moduleName)) {
        console.error(`Warning: Module ${moduleName} already existed, you can't update it to error`);
    } else {
        updateModule(moduleName, 7, { error });
    }
};

export { _import as import, _export as export, _throw as throw };

export const registerModuleResolver = resolverGenerator => {
    resolverGenerator({
        module,
        config,
        import: _import,
        export: _export,
        throw: _throw,
        register: (type, resolver) => (moduleResolverMap[type] = resolver)
    });
};
