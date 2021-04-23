import cjsResolverGenerator from '../resolver/cjs';

(<any>window).mod.registerModuleResolver(cjsResolverGenerator);
