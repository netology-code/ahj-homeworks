const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const config = require("../webpack.config");

const compiler = webpack(config);
const serverConfig = {
  ...config.devServer,
  port: 9000,
  host: "localhost",
  open: false, // Don't open browser automatically
};

const server = new WebpackDevServer(serverConfig, compiler);

server
  .start()
  .then(() => {
    if (process.send) {
      process.send("ok");
    }
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
