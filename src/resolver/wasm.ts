import promiseOnce from '../util/promiseOnce';

export default ({ module, config, register, import: _import }) => {
    const { moduleInfoResolver } = config;
    const { update: updateModule } = module;
    const resolver = promiseOnce(async moduleName => {
        try {
            if (!WebAssembly) throw new Error(`The browser don't support WebAssembly`);
            const moduleInfo = moduleInfoResolver(moduleName);
            let { file } = moduleInfo;
            if (Array.isArray(file)) {
                console.warn('Wasm only support single file module');
                file = file[0];
            }
            if (!file) throw new Error(`Can't find valid file for wasm`);
            updateModule(moduleName, 4);
            const response = await fetch(file);
            const bytes = await response.arrayBuffer();
            console.log(bytes);

            updateModule(moduleName, 6, { exports: bytes });
        } catch (error) {
            updateModule(moduleName, 7, { error });
        }
    });

    register('wasm', resolver);
};
