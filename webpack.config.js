const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const { ESBuildMinifyPlugin } = require('esbuild-loader');

module.exports = (webpackEnv) => {
  const mode = webpackEnv.WEBPACK_SERVE ? 'development' : 'production';

  return {
    mode,
    entry: './src/index.ts',
    output: { path: path.join(__dirname, 'lib'), filename: 'index.js' },
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
          use: ['ts-loader'],
          exclude: /node_modules/,
        },
        {
          test: /\.wasm$/,
          loader: 'base64-loader',
          type: 'javascript/auto',
        },
      ],
    },
    plugins: [new CleanWebpackPlugin(), new NodePolyfillPlugin()],
  };
};
