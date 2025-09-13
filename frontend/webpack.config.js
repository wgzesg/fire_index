const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    publicPath: '/',
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public', to: '' },
        { from: 'index.html', to: '' },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, '/'),
    },
    compress: true,
    port: 9000,
    historyApiFallback: true,
  },
};