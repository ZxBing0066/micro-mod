import amdResolverGenerator from '../src/resolver/amd';

(<any>window).mod.registerModuleResolver(amdResolverGenerator);
