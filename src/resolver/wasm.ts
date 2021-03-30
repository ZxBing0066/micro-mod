import { moduleInfoResolver } from '../config';
import promiseOnce from '../util/promiseOnce';
import { update as updateModule } from '../module';
import { import as _import, registerModuleResolver } from '../mod';

const resolver = promiseOnce(async moduleName => {
    try {
        if (!WebAssembly) throw new Error(`The browser don't support WebAssembly`);
        const moduleInfo = moduleInfoResolver(moduleName);
        let { file, dep } = moduleInfo;
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

registerModuleResolver('wasm', resolver);
