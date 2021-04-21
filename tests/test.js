(async function () {
    const processDOM = document.getElementById('process');
    const resultDOM = document.getElementById('result');

    const writeProcess = name => {
        const wrap = document.createElement('div');
        const status = document.createElement('span');
        status.className = 'status pending';
        status.innerText = 'pending';
        const message = document.createElement('span');
        message.className = 'message';
        message.innerText = name + ': pending';
        wrap.appendChild(status);
        wrap.appendChild(message);
        resultDOM.appendChild(wrap);
        return {
            wrap,
            status,
            message
        };
    };
    const writeResult = (doms, result) => {
        const { status, message } = doms;
        status.className = 'status success';
        status.innerText = 'success';
        message.className = 'message';
        message.innerText = result.name + ': ' + result.message;
    };
    const writeError = (doms, error) => {
        const { status, message } = doms;
        status.className = 'status error';
        status.innerText = 'error';
        message.className = 'message';
        message.innerText = error.testName + ': ' + error.message;
    };

    let totalTestCount = 0;
    let currentTestCount = 0;
    const process = () => {
        processDOM.innerText = `${++currentTestCount} / ${totalTestCount}`;
    };
    const addTest = () => {
        processDOM.innerText = `${currentTestCount} / ${++totalTestCount}`;
    };

    const test = async (name, runTest) => {
        addTest();
        const doms = writeProcess(name);
        try {
            await runTest();
            writeResult(doms, {
                name,
                message: 'success'
            });
        } catch (e) {
            console.error(e);
            e.testName = name;
            writeError(doms, e);
        }
        process();
    };
    const is = (v, vb) => {
        if (v === vb) return;
        throw new Error(`${v} is not equal to ${vb}`);
    };

    mod.config({
        modules: {
            dep: 'src/dep.js',
            noExportDep: 'src/no-export-dep.js'
        }
    });

    const timer = t => new Promise(resolve => setTimeout(resolve, t));

    test('base', async () => {
        const dep = await mod.import('dep');
        is(dep.name, 'dep');
    });

    test('chain', async () => {
        mod.config({
            modules: {
                module: {
                    js: 'src/module.js',
                    dep: 'module-dep'
                },
                'module-dep': 'src/module-dep.js'
            }
        });
        const module = await mod.import('module');
        if (module.name !== 'module' || module.dep.name !== 'moduleDep') throw new Error('Wrong module loaded');
    });

    test('default timeout', async () => {
        try {
            await Promise.race([mod.import('noExportDep'), timer(6000)]);
        } catch (e) {
            if (e.message === 'Wait for module noExportDep timeout') {
                return;
            }
            throw e;
        }
        throw new Error('Module should be timeout');
    });

    test('global support', async () => {
        mod.config({
            modules: {
                globalModule: {
                    js: './src/global-module.js',
                    type: 'global'
                },
                globalModuleNamed: {
                    js: './src/global-module-named.js',
                    type: ['global', '_globalModuleNamed']
                }
            }
        });
        const globalModule = await mod.import('globalModule');
        if (globalModule.name !== 'globalModule' || window.globalModule !== globalModule) {
            throw new Error('Wrong global module loaded');
        }
        const globalModuleNamed = await mod.import('globalModuleNamed');
        if (globalModuleNamed.name !== 'globalModuleNamed' || window._globalModuleNamed !== globalModuleNamed) {
            throw new Error('Wrong global named module loaded');
        }
    });
    mod.config({
        modules: {
            react: {
                js: 'https://cdn.jsdelivr.net/npm/react@16.13.1/umd/react.development.js',
                type: 'amd'
            },
            'react-dom': {
                js: 'https://cdn.jsdelivr.net/npm/react-dom@16.13.1/umd/react-dom.development.js',
                type: 'amd'
            }
        }
    });
    test('amd support', async () => {
        const [React, ReactDOM] = await mod.import(['react', 'react-dom']);
        if (React.version !== '16.13.1' || typeof React.lazy !== 'function') throw new Error('Wrong React loaded');
        if (ReactDOM.version !== '16.13.1' || typeof ReactDOM.render !== 'function')
            throw new Error('Wrong ReactDOM loaded');
        const el = document.getElementById('react-test-area');
        ReactDOM.render(
            React.createElement(
                'div',
                { style: { background: '#ccc', padding: '30px', textAlign: 'center' } },
                'React success'
            ),
            el
        );
        if (el.querySelector('div').innerText !== 'React success') throw new Error('React render wrong');
    });

    test('cjs support', async () => {
        mod.config({
            modules: {
                cjs: {
                    js: './src/cjs.js',
                    dep: ['react', 'react-dom'],
                    type: 'cjs'
                }
            }
        });
        const cjs = await mod.import('cjs');
        console.error(cjs);
        if (typeof cjs.reactVersion !== 'string' || typeof cjs.reactDOMVersion !== 'string') {
            throw new Error('Cjs support test fail');
        }
    });

    await test('config timeout', async () => {
        mod.config({
            timeout: 1000
        });
        try {
            await Promise.race([mod.import('noExportDep'), timer(2000)]);
        } catch (e) {
            if (e.message === 'Wait for module noExportDep timeout') {
                return;
            }
            throw e;
        }
        throw new Error('Module should be timeout');
    });

    await test('baseUrl', async () => {
        mod.config({
            baseUrl: './src/',
            modules: {
                depWithoutBaseUrl: 'dep-without-baseurl.js'
            }
        });
        const dep = await mod.import('depWithoutBaseUrl');
        is(dep.name, 'depWithoutBaseUrl');
    });

    await test('unknown module', async () => {
        try {
            await mod.import('https://test.test/unknown.js');
            throw new Error('module should not found');
        } catch (error) {
            if (error.message === 'module should not found') throw error;
            console.error(error);
            return;
        }
    });

    await test('throw', async () => {
        try {
            mod.config({
                modules: {
                    throw: 'throw.js'
                }
            });
            await mod.import('throw');
            throw new Error('module should throw');
        } catch (error) {
            if (error.message === 'module should throw') throw error;
            console.error(error);
            return;
        }
    });
})();
