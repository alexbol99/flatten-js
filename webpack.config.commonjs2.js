const path = require('path');
const fs = require('fs');

const config = {
    entry: './index.js',
    output: {
        library: "flatten",
        path: path.resolve(__dirname, 'dist'),
        filename: 'flatten.commonjs2.js',
        libraryTarget: 'commonjs2'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['babel-preset-env'],
                        plugins: [["babel-plugin-transform-builtin-classes", {
                          "globals": ["Set"]
                        }]],
                        babelrc: false
                    }
                }
            }
        ],
    },
    plugins: [],
    devtool: "source-map"
};

// config.plugins = config.plugins.filter((plugin) => plugin.constructor.name !== 'UglifyJsPlugin');

module.exports = config;
