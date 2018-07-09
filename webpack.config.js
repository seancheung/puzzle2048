const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = mode => {
    const config = {
        entry: { main: path.resolve(__dirname, 'src/index.js') },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'www')
        },
        module: {
            rules: [
                { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ },
                {
                    type: 'javascript/auto',
                    test: /[\\/]res[\\/]assets[\\/]/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: { name: 'assets/[name].[ext]' }
                        }
                    ]
                },
                { test: /\.(vert|frag)$/, use: 'raw-loader' }
            ]
        },
        resolve: { alias: { assets: path.resolve(__dirname, 'res/assets') } },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all'
                    }
                }
            }
        },
        plugins: [
            new webpack.DefinePlugin({
                CANVAS_RENDERER: true,
                WEBGL_RENDERER: true
            }),
            new CleanWebpackPlugin(['www/*'], {
                root: __dirname,
                exclude: ['.gitignore']
            }),
            new HtmlWebpackPlugin({
                title: 'Puzzle 2048',
                template: 'res/index.html'
            })
        ]
    };

    if (mode === 'production') {
        config.plugins.push(
            new UglifyJsPlugin({ parallel: true, extractComments: true })
        );
    }

    return config;
};
