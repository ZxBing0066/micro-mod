import promiseOnce from '../util/promiseOnce';

export default ({ module, register, import: _import }) => {
    const { update: updateModule } = module;
    const resolver = promiseOnce(async (moduleName, moduleInfo) => {
        try {
            if (!WebAssembly) throw new Error(`The browser don't support WebAssembly`);
            let { file, dep } = moduleInfo;
            if (Array.isArray(file)) {
                console.warn('Wasm only support single file module');
                file = file[0];
            }
            if (!file) throw new Error(`Can't find valid file for wasm`);
            updateModule(moduleName, 4);
            const depPending = Promise.all(dep.map(dep => _import(dep)));
            const response = await fetch(file);
            const bytes = await response.arrayBuffer();
            await depPending;
            updateModule(moduleName, 6, { exports: bytes });
        } catch (error) {
            updateModule(moduleName, 7, { error });
        }
    });

    register('wasm', resolver);
};
