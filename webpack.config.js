const path = require('path');

module.exports = {
    mode: 'production',
    entry: './contentScript.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'contentScript.bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
};
