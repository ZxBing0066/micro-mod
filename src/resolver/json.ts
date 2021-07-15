import { load } from '../loader/fileLoader';
import promiseOnce from '../util/promiseOnce';

export default ({ module, register, import: _import }) => {
    const { register: registerModule, update: updateModule, wait: waitModule } = module;

    const resolver = promiseOnce(async (moduleName, moduleInfo) => {
        try {
            registerModule(moduleName);
        } catch (e) {
            await waitModule(moduleName, 6);
        }
        try {
            const { file, dep } = moduleInfo;
            const filePath = Array.isArray(file) ? file?.[0] : file;
            if (!filePath) {
                throw new Error(`There is no file for module: ${moduleName}`);
            }
            await _import(dep);
            updateModule(moduleName, 4);
            const raw = await load(filePath);
            const json = JSON.parse(raw);
            updateModule(moduleName, 6, { exports: json });
        } catch (error) {
            updateModule(moduleName, 7, { error });
            console.error(error);
        }
    });

    register('json', resolver);
};
