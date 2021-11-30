import { load } from '../loader/scriptLoaderPromise';
import promiseOnce from '../util/promiseOnce';

export default ({ module, register, import: _import }) => {
    const { register: registerModule, update: updateModule, wait: waitModule } = module;

    const resolver = promiseOnce(async (moduleName, moduleInfo, globalName) => {
        try {
            registerModule(moduleName);
        } catch (e) {
            await waitModule(moduleName, 6);
        }
        try {
            const { js, dep, options } = moduleInfo;
            const script = js?.[0];
            if (!script) {
                throw new Error(`There is no file for module: ${moduleName}`);
            }
            await _import(dep);
            updateModule(moduleName, 4);
            await load(script, options);
            updateModule(moduleName, 6, { exports: window[globalName || moduleName] });
        } catch (error) {
            updateModule(moduleName, 7, { error });
            console.error(error);
        }
    });

    register('global', resolver);
};
