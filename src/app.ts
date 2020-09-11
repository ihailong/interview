import express, { Request, Response, NextFunction } from "express";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import lusca from "lusca";
import mongo from "connect-mongo";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";

const MongoStore = mongo(session);

// Controllers (route handlers)
import * as homeController from "./controllers/home";
import * as apiController from "./controllers/api";

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

console.log(`Connecting to MongoDB ${mongoUrl}`);

mongoose.connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false }).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
    console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
    // process.exit();
});

// Express configuration 
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: new MongoStore({
        url: mongoUrl,
        autoReconnect: true
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));

app.use(
    express.static(path.join(__dirname, "public"), { maxAge: 30 * 24 * 3600 * 1000 })
);

/**
 * Home page to create a short url in a web page
 */
app.get("/", homeController.index);

/** 
 * API to create short url
 */
app.post("/api/shorturls", apiController.createShortUrl);

/**
 * The redirect service for a short url
 */
app.get("/s/:code", apiController.redirectShortUrl);

app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    if(err) res.json(err);
});


export default app;
