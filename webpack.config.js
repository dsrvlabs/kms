const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const { ESBuildMinifyPlugin } = require('esbuild-loader');

module.exports = (webpackEnv) => {
  const mode = webpackEnv.WEBPACK_SERVE ? 'development' : 'production';

  return {
    mode,
    entry: './src/index.ts',
    output: { path: path.join(__dirname, 'lib'), filename: '[name].js' },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      fallback: {
        path: false,
        fs: false,
        Buffer: false,
        process: false,
      },
    },
    optimization: {
      minimizer: [
        new ESBuildMinifyPlugin({
          target: 'es2015',
        }),
      ],
    },
    module: {
      noParse: /\.wasm$/,
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          loader: 'esbuild-loader',
          exclude: /node_modules/,
          options: {
            loader: 'tsx',
            target: 'es2015',
          },
        },
        {
          test: /\.wasm$/,
          loader: 'base64-loader',
          type: 'javascript/auto',
        },
      ],
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js',
          },
        ],
      }),
      new CleanWebpackPlugin(),
      new NodePolyfillPlugin(),
    ],
  };
};
