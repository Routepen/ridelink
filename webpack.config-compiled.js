var webpack = require("webpack");

module.exports = {
  entry: ['./client.js'],
  output: {
    path: __dirname + '/public/js/',
    filename: 'bundle.js',
    publicPath: '/js'
  },
  plugins: [new webpack.optimize.OccurrenceOrderPlugin(), new webpack.HotModuleReplacementPlugin(), new webpack.NoEmitOnErrorsPlugin()],
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        presets: ['react', 'es2015', 'react-hmre']
      }
    }]
  }
};

//# sourceMappingURL=webpack.config-compiled.js.map