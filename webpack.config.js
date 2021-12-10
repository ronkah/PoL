const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
  entry: "./scripts/start.js",
  output: {
    // path: path.resolve(__dirname, "./target/"),
    path: path.resolve(__dirname, "./docs/"),

    filename: "start.js",
  },
  mode: "development",
  plugins: [
    // new CopyWebpackPlugin(['index.html', "node_modules/bootstrap/dist/css/bootstrap.min.css", "styles/index.css", "styles/presented_by_qedit.svg"])
    new CopyWebpackPlugin(['index.html', "styles/index.css"])
  ],
};
