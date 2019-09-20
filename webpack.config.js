const path = require('path');
const config = require('./package.json');
const build = require('yargs').argv.env === 'build';
const entryPoint = build ? '/src/workers/APE.js' : '/src/index.js';

module.exports = {
  mode: build ? 'production' : 'development',
  entry: __dirname + entryPoint,
  devtool: 'inline-source-map',

  module: {
    rules: [{
      loader: 'babel-loader',
      test: /(\.jsx|\.js)$/,
      exclude: /node_modules/
      // }, {
      // loader: 'worker-loader',
      // test: /\.worker\.js$/,
      // exclude: /node_modules/,

      // options: {
      //   inline: true,
      //   name: 'worker.js'
      // }
    }]
  },

  resolve: {
    alias: { '@': path.resolve('./src') },
    extensions: ['.json', '.js'],

    modules: [
      path.resolve('./node_modules'),
      path.resolve('./src')
    ]
  },

  optimization: {
    minimize: build
  },

  output: {
    globalObject: "typeof self !== 'undefined' ? self : this",
    filename: `${config.name}${build ? '.min' : ''}.js`,
    path: __dirname + '/build',
    umdNamedDefine: true,

    libraryExport: 'default',
    library: config.name,
    libraryTarget: 'umd'
  }
};
