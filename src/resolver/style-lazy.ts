import promiseOnce from '../util/promiseOnce';
import { load } from '../loader/fileLoader';

export default ({ module, config, register, import: _import }) => {
    const { moduleInfoResolver } = config;
    const { register: registerModule, update: updateModule, wait: waitModule } = module;

    const head = document.head || document.getElementsByTagName('head')[0];
    const createStyleTag = content => {
        const el = document.createElement('style');
        el.innerHTML = content;
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
            let cssContent;
            const contentLoad = Promise.all(css.map(load)).then(result => (cssContent = result));
            await Promise.all([contentLoad, _import(dep)]);
            const els = cssContent.map(createStyleTag);
            let lock = false;
            updateModule(moduleName, 6, {
                exports: {
                    use: () => {
                        if (lock) return;
                        lock = true;
                        els.map(el => head.appendChild(el));
                    },
                    unuse: () => {
                        if (!lock) return;
                        lock = false;
                        els.map(el => head.removeChild(el));
                    }
                }
            });
        } catch (error) {
            updateModule(moduleName, 7, { error });
            console.error(error);
        }
    });

    register('style-lazy', resolver);
};
