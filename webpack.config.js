const path = require('path');
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
                    test: /\/res\/assets\//,
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
        resolve: { alias: { res: path.resolve(__dirname, 'res/assets') } },
        optimization: {
            splitChunks: {
                chunks: 'all',
                minSize: 30000,
                minChunks: 1,
                maxAsyncRequests: 5,
                maxInitialRequests: 3,
                automaticNameDelimiter: '~',
                name: true,
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10
                    },
                    default: {
                        minChunks: 2,
                        priority: -20,
                        reuseExistingChunk: true
                    }
                }
            }
        },
        plugins: [
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
