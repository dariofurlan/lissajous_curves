const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin');

module.exports = {
    target: 'web',
    entry: path.join(__dirname, "src/index.js"),
    plugins: [
        new HtmlWebpackPlugin({
            template: "src/index.html"
        }),
        new HtmlReplaceWebpackPlugin([{
                pattern: '__YEAR__',
                replacement: JSON.stringify(new Date().getFullYear()),
            }]),
        new CopyWebpackPlugin([{from: "src/favicon-32x32.png"}, {from: "src/favicon-16x16.png"}, {from: "src/favicon.ico"}]),
        new webpack.DefinePlugin({
            __YEAR__: JSON.stringify(new Date().getFullYear()), //TODO actually load this var from config file
        }),
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