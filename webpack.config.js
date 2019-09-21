const path = require('path');
const config = require('./package.json');
const worker = require('yargs').argv.worker;
const build = require('yargs').argv.env === 'build';
const entryPoint = build ? `${worker ? 'workers/' : ''}${config.name}.js` : 'index.js';

module.exports = {
  mode: build ? 'production' : 'development',
  entry: `${__dirname}/src/${entryPoint}`,
  devtool: 'inline-source-map',

  module: {
    rules: [{
      loader: 'babel-loader',
      test: /(\.jsx|\.js)$/,
      exclude: /node_modules/
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
    filename: `${config.name}${worker ? '.worker' : ''}${build ? '.min' : ''}.js`,
    globalObject: 'typeof self !== \'undefined\' ? self : this',
    path: __dirname + '/build',
    umdNamedDefine: true,

    libraryExport: 'default',
    library: config.name,
    libraryTarget: 'umd'
  }
};
