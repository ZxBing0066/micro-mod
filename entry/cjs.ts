import cjsResolverGenerator from '../src/resolver/cjs';

(<any>window).mod.registerModuleResolver(cjsResolverGenerator);
