const path = require("path");

module.exports = {
  entry: './dist/bogus.js',
  devServer: {
    static: {
      directory: path.join(__dirname, './dist'),
    },
    compress: true,
    port: 8080,
  },
  mode: 'none',
};