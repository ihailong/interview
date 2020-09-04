import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";

export const ENVIRONMENT = process.env.NODE_ENV || "development";
const prod = ENVIRONMENT === "production"; // Anything else is treated as 'dev'

const envPath =  `${process.cwd()}/config/${ENVIRONMENT}.env`;
logger.info(`config environment variables in ${envPath}`);

if(!fs.existsSync(envPath)){
    logger.error(`env path not found at ${envPath}, exit!`);
    process.exit(1);
}
dotenv.config({ path: envPath});

export const LOCAL_DOMAIN = "http://localhost:3000";

export const SESSION_SECRET = process.env["SESSION_SECRET"];
export const MONGODB_URI = prod ? process.env["MONGODB_URI"] : process.env["MONGODB_URI_LOCAL"];

if (!SESSION_SECRET) {
    logger.error("No client secret. Set SESSION_SECRET environment variable.");
    process.exit(1);
}

if (!MONGODB_URI) {
    if (prod) {
        logger.error("No mongo connection string. Set MONGODB_URI environment variable.");
    } else {
        logger.error("No mongo connection string. Set MONGODB_URI_LOCAL environment variable.");
    }
    process.exit(1);
}
