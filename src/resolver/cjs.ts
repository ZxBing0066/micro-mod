import { load } from '../loader/fileLoader';
import promiseOnce from '../util/promiseOnce';

export default ({ module, config, register, import: _import }) => {
    const { moduleInfoResolver } = config;
    const { register: registerModule, update: updateModule, wait: waitModule } = module;

    const resolver = promiseOnce(async moduleName => {
        try {
            registerModule(moduleName);
        } catch (e) {
            await waitModule(moduleName, 6);
        }
        try {
            const moduleInfo = moduleInfoResolver(moduleName);
            const { js, dep } = moduleInfo;
            const script = js?.[0];
            if (!script) {
                throw new Error(`There is no file for module: ${moduleName}`);
            }
            await _import(dep);
            updateModule(moduleName, 4);
            const scriptContent = await load(script);
            const execScriptContent = `
(function() {
    var mod = window.mod;
    var dep = ${JSON.stringify(dep)};
    var moduleName = ${JSON.stringify(moduleName)};
    mod.import(dep).then(function(deps) {
        var depsMap = {};
        deps.forEach(function(module, i) {
            depsMap[dep[i]] = module;
        });
        var require = function(moduleName) {
            return depsMap[moduleName];
        };
        var module = {
            exports: {}
        };
        ${scriptContent}
        ;mod.export(moduleName, module.exports);
    });
})();`;
            const scriptTag = document.createElement('script');
            scriptTag.innerText = execScriptContent;
            scriptTag.setAttribute('data-mod-cjs', moduleName);
            document.querySelector('head').appendChild(scriptTag);
        } catch (error) {
            updateModule(moduleName, 7, { error });
            console.error(error);
        }
    });

    register('cjs', resolver);
};
