const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    entry: {
        mod: './index.js'
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
        contentBase: './dist'
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
