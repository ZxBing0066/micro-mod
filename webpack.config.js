const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    entry: {
        mod: './entry/index',
        'resolver-amd': './entry/amd',
        'resolver-global': './entry/global',
        'resolver-css-lazy': './entry/css-lazy',
        'resolver-style-lazy': './entry/style-lazy',
        'resolver-wasm': './entry/wasm'
    },
    output: {
        filename: process.env.POLYFILL ? '[name].polyfill.min.js' : '[name].min.js'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    },
    mode: process.env.NODE_ENV,
    devtool: process.env.NODE_ENV === 'development' ? 'inline-source-map' : 'source-map',
    devServer: {
        contentBase: './dist',
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    },
    plugins: [...(process.env.ANALYZER ? [new BundleAnalyzerPlugin()] : [])],
    module: {
        rules: [
            {
                oneOf: [
                    {
                        test: /(\.js|\.jsx|\.ts|\.tsx)$/,
                        use: [
                            {
                                loader: 'babel-loader',
                                options: process.env.POLYFILL
                                    ? require('./.babelrc.polyfill.js')
                                    : require('./babel.config.js')
                            }
                        ],
                        exclude: /node_modules/
                    }
                ]
            }
        ]
    }
};
