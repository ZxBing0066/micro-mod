mod.import([
    '//cdn.jsdelivr.net/npm/@rapiop/mod@1.0.1/dist/resolver-amd.min.js',
    '//cdn.jsdelivr.net/npm/@rapiop/mod@1.0.1/dist/resolver-cjs.min.js'
]).then(() => {
    mod.config({
        modules: {
            react: {
                js: '//cdn.jsdelivr.net/npm/react@16/umd/react.production.min.js',
                type: 'amd'
            },
            'react-dom': {
                js: '//cdn.jsdelivr.net/npm/react-dom@16/umd/react-dom.production.min.js',
                type: 'amd',
                dep: 'react'
            },
            'raf-manager': {
                js: '//cdn.jsdelivr.net/npm/raf-manager@0.3.0/build/RAFManager.min.js',
                type: 'amd'
            },
            'proton-engine': {
                js: '//cdn.jsdelivr.net/npm/proton-engine@4.2.1/build/proton.min.js',
                type: 'amd'
            },
            'particales-bg': {
                js: '//cdn.jsdelivr.net/npm/particles-bg@2.5.5/dist/index.min.js',
                type: 'cjs',
                dep: ['react', 'raf-manager', 'proton-engine']
            }
        }
    });
    mod.import(['react', 'react-dom', 'particales-bg']).then(([React, ReactDOM, ParticlesBg]) => {
        ReactDOM.render(
            React.createElement(ParticlesBg, {
                type: 'custom',
                bg: true,
                config: {
                    num: [4, 7],
                    rps: 0.1,
                    radius: [5, 40],
                    life: [1.5, 3],
                    v: [2, 3],
                    tha: [-40, 40],
                    alpha: [0.6, 0],
                    scale: [0.1, 0.4],
                    position: 'all',
                    color: 'random',
                    cross: 'dead',
                    random: 15
                }
            }),
            document.querySelector('#bg')
        );
    });
});
