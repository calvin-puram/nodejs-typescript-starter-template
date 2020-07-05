import "dotenv/config";
import App from "./app";
import IndexRoute from "./routes/index.routes";
import UserRoute from "./routes/user.routes";
import AuthRoute from "./routes/auth.routes";
import logger from "./utils/logger";

const app = new App([new IndexRoute(), new UserRoute(), new AuthRoute()]);

const server = app.listen();

//unhandled promise rejection
process.on("unhandledRejection", (err) => {
  logger.error(`unhandled rejection: ${err}`);
  process.exit(1);
});
