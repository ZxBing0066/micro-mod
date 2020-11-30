import { import as _import, export as _export, throw as _throw } from './src/mod';
import config from './src/config';

const mod = {
    import: _import,
    export: _export,
    throw: _throw,
    config
};

window.mod = mod;
