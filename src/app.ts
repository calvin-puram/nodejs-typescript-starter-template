import * as express from "express";
import * as helmet from "helmet";
import * as hpp from "hpp";
import * as cors from "cors";
import * as cookieParser from "cookie-parser";
import * as morgan from "morgan";
import * as mongoose from "mongoose";
import Route from "./interface/routes.interface";
import logger from "./utils/logger";
import errorMiddleware from "./middleware/error.middleware";
import * as globalPath from "path";
import * as rateLimit from "express-rate-limit";
import * as mongoSanitize from "express-mongo-sanitize";
import * as compression from "compression";
import "pug";

class App {
  public app: express.Application;
  public port: number | string;
  public env: boolean;

  constructor(routes: Route[]) {
    this.app = express();
    this.port = process.env.PORT || 4000;
    this.env = process.env.NODE_ENV === "production" ? true : false;

    this.initializeException();
    this.initializeMiddleware();
    this.connectToDatabase();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  private initializeException() {
    process.on("uncaughtException", (err) => {
      logger.error(`uncaught exception: ${err.message}`);
      process.exit(1);
    });
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`🚀 App listening on the port ${this.port}`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddleware() {
    if (this.env) {
      this.app.use(helmet());
      this.app.use(hpp());
      this.app.use(morgan("tiny"));
      this.app.use(cors({ origin: "your domain", credentials: true }));
      const limiter = rateLimit({
        windowMs: 10 * 60 * 1000,
        max: 100,
        message: "Too many request from this IP, please try again after 10mins",
      });
      this.app.use(limiter);
      this.app.use(mongoSanitize());
      this.app.use(compression());
    } else {
      this.app.use(morgan("dev"));
      this.app.use(cors({ origin: true, credentials: true }));
    }

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.set("view engine", "pug");
    this.app.set("views", globalPath.join(__dirname, "views"));
    this.app.use(express.static(globalPath.join(__dirname, "public")));
  }

  private connectToDatabase() {
    const options = {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    };

    mongoose
      .connect(process.env.MONGO_URL_TEST, { ...options })
      .then(() => logger.info("connected to database"))
      .catch((err) => logger.error(err.message));
  }

  private initializeRoutes(routes: Route[]) {
    routes.forEach((route) => {
      this.app.use("/", route.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
