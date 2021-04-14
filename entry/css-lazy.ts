import cssLazyResolverGenerator from '../src/resolver/css-lazy';

(<any>window).mod.registerModuleResolver(cssLazyResolverGenerator);
