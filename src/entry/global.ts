import globalResolverGenerator from '../resolver/global';

(<any>window).mod.registerModuleResolver(globalResolverGenerator);
