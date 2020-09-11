import { createLogger, format, transports, LoggerOptions } from "winston";

const alignedWithColorsAndTime = format.combine(
    format.splat(),
    format.simple(),
    format.timestamp(),
    //format.align(),
    format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)
);

const options: LoggerOptions = {
    format: alignedWithColorsAndTime,
    transports: [
        new transports.Console({
            level: process.env.NODE_ENV === "production" ? "error" : "debug"
        }),
        new transports.File({ filename: "debug.log", level: "debug" })
    ]
};

const logger = createLogger(options);

if (process.env.NODE_ENV !== "production") {
    logger.debug("Logging initialized at debug level");
}

export default logger;
