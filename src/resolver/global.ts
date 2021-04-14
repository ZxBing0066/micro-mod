import { load } from '../loader/scriptLoaderPromise';
import promiseOnce from '../util/promiseOnce';

export default ({ module, config, register, import: _import }) => {
    const { moduleInfoResolver } = config;
    const { register: registerModule, update: updateModule, wait: waitModule } = module;

    const resolver = promiseOnce(async (moduleName, globalName) => {
        try {
            registerModule(moduleName);
        } catch (e) {
            await waitModule(moduleName, 6);
        }
        try {
            const moduleInfo = moduleInfoResolver(moduleName);
            const { js, dep } = moduleInfo;
            const script = js?.[0];
            if (!script) {
                throw new Error(`There is no file for module: ${moduleName}`);
            }
            await _import(dep);
            updateModule(moduleName, 4);
            await load(script);
            updateModule(moduleName, 6, { exports: window[globalName || moduleName] });
        } catch (error) {
            updateModule(moduleName, 7, { error });
            console.error(error);
        }
    });

    register('global', resolver);
};
