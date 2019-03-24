const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    target: 'web',
    entry: path.join(__dirname, "src/index.js"),
    plugins: [
        new HtmlWebpackPlugin({
            template: "src/index.html"
        }),
        new CopyWebpackPlugin([{from:"src/favicon-32x32.png"},{from:"src/favicon-16x16.png"},{from:"src/favicon.ico"}])
    ],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [{
            test: /\.scss/,
            use: ['style-loader', 'css-loader', 'sass-loader'],
        }, {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }],
    },
};