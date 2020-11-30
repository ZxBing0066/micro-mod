const browserslist = require('./.browserslist');

module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: browserslist,
                useBuiltIns: false,
                corejs: '3'
            }
        ],
        ['@babel/preset-typescript']
    ],
    plugins: ['@babel/plugin-transform-runtime']
};
