import cssLazyResolverGenerator from '../resolver/css-lazy';

(<any>window).mod.registerModuleResolver(cssLazyResolverGenerator);
