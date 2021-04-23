import amdResolverGenerator from '../resolver/amd';

(<any>window).mod.registerModuleResolver(amdResolverGenerator);
