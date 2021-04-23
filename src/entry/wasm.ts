import wasmResolverGenerator from '../resolver/wasm';

(<any>window).mod.registerModuleResolver(wasmResolverGenerator);
