import { import as _import, export as _export } from './src/mod';
import config from './src/config';

const mod = {
    import: _import,
    export: _export,
    config
};

window.mod = mod;
