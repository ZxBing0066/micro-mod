import { moduleInfoResolver } from '../config';
import promiseOnce from '../util/promiseOnce';
import { register as registerModule, update as updateModule, wait as waitModule } from '../module';
import { import as _import, registerModuleResolver } from '../mod';

import pendingFactory from '../util/pendingFactory';

const head = document.head || document.getElementsByTagName('head')[0];
const load = async (href: string) => {
    const el = document.createElement('link');
    el.type = 'text/css';
    el.rel = 'stylesheet';
    el.href = href;
    const [pending, ready, error] = pendingFactory();
    el.addEventListener('load', () => {
        ready();
    });
    el.addEventListener('error', e => {
        error(e);
    });
    head.appendChild(el);
    await pending;
    return el;
};

const resolver = promiseOnce(async moduleName => {
    try {
        registerModule(moduleName);
    } catch (e) {
        await waitModule(moduleName, 6);
    }
    try {
        const moduleInfo = moduleInfoResolver(moduleName);
        const { css, dep } = moduleInfo;

        if (!css?.length) {
            throw new Error(`There is no file for module: ${moduleName}`);
        }
        updateModule(moduleName, 4);
        await _import(dep);
        let currentLinks;
        let lock = false;
        updateModule(moduleName, 6, {
            exports: {
                use: async () => {
                    if (lock) return;
                    lock = true;
                    currentLinks = await Promise.all(css.map(load));
                },
                unuse: () => {
                    if (!lock) return;
                    lock = false;
                    currentLinks.forEach(el => head.removeChild(el));
                    currentLinks = null;
                }
            }
        });
    } catch (error) {
        updateModule(moduleName, 7, { error });
        console.error(error);
    }
});

registerModuleResolver('css-lazy', resolver);
