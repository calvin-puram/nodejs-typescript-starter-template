import * as winston from "winston";
import "dotenv/config";

const DEBUG = process.env.DEBUG === "true" ? true : false;

const winstonLogger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

/**
 * Console logger used throughout the app
 * @exports
 */
export default {
  /**
   * @param {*} data - the data to be logged
   * @returns {void}
   */
  info(data: string) {
    winstonLogger.info(data);
  },
  /**
   * @param {*} data - the data to be logged
   * @returns {void}
   */
  error(data: string) {
    winstonLogger.info(data);
  },
};
