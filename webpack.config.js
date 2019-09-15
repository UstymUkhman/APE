const path = require('path');
const config = require('./package.json');
const build = require('yargs').argv.env === 'build';

module.exports = {
  mode: build ? 'production' : 'development',
  entry: __dirname + '/src/index.js',
  devtool: 'inline-source-map',

  module: {
    rules: [{
      loader: 'babel-loader',
      test: /(\.jsx|\.js)$/,
      exclude: /node_modules/
    }, {
      loader: 'worker-loader',
      test: /\.worker\.js$/,
      exclude: /node_modules/,

      options: {
        name: `${build ? '' : '[hash].'}worker.js`
      }
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
    library: config.name,
    libraryTarget: 'umd'
  }
};
