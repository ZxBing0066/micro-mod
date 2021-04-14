import { import as _import, export as _export, throw as _throw, registerModuleResolver } from './mod';
import config from './config';

const mod = {
    import: _import,
    export: _export,
    throw: _throw,
    config,
    registerModuleResolver
};

export default mod;
