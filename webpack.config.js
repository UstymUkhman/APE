const libraryName = 'APE';
const path = require('path');
const webpack = require('webpack');
const build = require('yargs').argv.env === 'build';

const plugins = [new webpack.ProvidePlugin({ 'THREE': 'THREE' })];
const outputFile = libraryName + (build ? '.min' : '') + '.js';

module.exports = {
  entry: __dirname + '/src/index.js',
  devtool: 'source-map',
  mode: 'development',

  module: {
    rules: [{
      test: /(\.jsx|\.js)$/,
      loader: 'babel-loader',
      exclude: /(node_modules|bower_components)/
    }, {
      test: /(\.jsx|\.js)$/,
      loader: 'eslint-loader',
      exclude: /node_modules/
    }, {
      test: /(\.glsl|\.frag|\.vert)$/,
      loader: 'raw-loader'
    }, {
      test: /\.worker\.js$/,
      loader: 'worker-loader',
      exclude: /node_modules/
    }
    ]
  },

  resolve: {
    modules: [path.resolve('./src'), path.resolve('./node_modules')],
    extensions: ['.json', '.js'],

    alias: {
      'THREE': path.resolve('./node_modules/three/src/Three.js'),
      '@': path.resolve('./src')
    }
  },

  optimization: {
    minimize: build
  },

  output: {
    path: __dirname + '/build',
    filename: outputFile,
    library: libraryName,
    umdNamedDefine: true,
    libraryTarget: 'umd'
  },

  plugins: plugins
};
