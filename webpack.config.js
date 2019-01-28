const path = require('path');
const webpack = require('webpack');
const env = require('yargs').argv.env;
const minimize = webpack.optimize.minimize;

const libraryName = 'SWAGE';

let plugins = [
    new webpack.ProvidePlugin({
      'THREE': 'THREE'
    })
  ], outputFile;

if (env === 'build') {
  plugins.push(minimize);
  outputFile = libraryName + '.min.js';
} else {
  outputFile = libraryName + '.js';
}

module.exports = {
  entry: __dirname + '/src/index.js',
  devtool: 'source-map',
  mode: 'development',

  output: {
    path: __dirname + '/build',
    filename: outputFile,
    library: libraryName,
    umdNamedDefine: true,
    libraryTarget: 'umd'
  },

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
      'THREE': path.resolve('./node_modules/three/src/Three.js')
    }
  },

  plugins: plugins
};
