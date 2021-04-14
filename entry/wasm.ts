import wasmResolverGenerator from '../src/resolver/wasm';

(<any>window).mod.registerModuleResolver(wasmResolverGenerator);
