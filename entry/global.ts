import globalResolverGenerator from '../src/resolver/global';

(<any>window).mod.registerModuleResolver(globalResolverGenerator);
