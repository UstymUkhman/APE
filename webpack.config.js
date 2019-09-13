const path = require('path');
const config = require('./package.json');
const build = require('yargs').argv.env === 'build';

module.exports = {
  mode: build ? 'production' : 'development',
  entry: __dirname + '/src/index.js',
  devtool: 'inline-source-map',

  module: {
    rules: [{
      test: /(\.jsx|\.js)$/,
      exclude: /node_modules/,
      use: ['babel-loader']
    }, {
      test: /\.worker\.js$/,
      exclude: /node_modules/,
      use: ['worker-loader']
    }
    ]
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
