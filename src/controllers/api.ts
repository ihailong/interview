"use strict";


import { Response, Request, NextFunction } from "express";
import validator from "validator";
import crypto from "crypto";
import { IShortURL, SHORT_URL_COLLECTION_NAME, MAX_SHORT_COUNT_NUM } from "../models/ShortUrl";
import * as shortUrlModel from "../models/ShortUrl";
import { CounterDocument } from "../models/Counter";
import * as counterModel from "../models/Counter";
import * as codec from "../util/codec";
import logger from "../util/logger";
import { CommonError, ErrorCode } from "../models/Common";



export const redirectShortUrl = async (req: Request, res: Response, next: NextFunction) => {
    const code: string = req.params.code;
    if (!code) return next(new CommonError(ErrorCode.ERROR_INVALID_PARAM, "code not found"));

    const doc: IShortURL = await shortUrlModel.getByCode(code);

    if (doc && doc.normalUrl) {
        logger.info("redirect to %s", doc.normalUrl);
        return res.redirect(doc.normalUrl);
    }
    res.status(404).send("Not Found");
};


export const createShortUrl = async (req: Request, res: Response, next: NextFunction) => {


    const longUrl: string = req.body.url;
    if (!(longUrl && validator.isURL(longUrl))) {
        return next(new CommonError(ErrorCode.ERROR_INVALID_PARAM, `invalid url ${longUrl}`));
    }

    const md5 = crypto.createHash("md5").update(longUrl, "utf8").digest("hex");

    const doc: IShortURL = await shortUrlModel.getByhash(md5);
    if (doc) return res.json({ rtn: 0, data: doc });

    const counter: CounterDocument = await counterModel.getNextId(SHORT_URL_COLLECTION_NAME);

    
    /**
     * @author ihailong
     * @description make the count field could be recursively used. however, we could think about how to provide earlier generated urls from overwrited.
     */
    counter.count %= MAX_SHORT_COUNT_NUM;
    const code: string = codec.encodeBase62(counter.count);

    logger.info("the count number is %d, code is '%s'", counter.count, code);

    const shortDoc: IShortURL = {
        hash: md5,
        normalUrl: longUrl,
        shortKeyCode: code,
        shortKeyId: counter.count
    };

    const resultDoc: IShortURL = await shortUrlModel.create(shortDoc);
    return res.json({ rtn: 0, data: resultDoc });
};