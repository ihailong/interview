/* eslint-disable @typescript-eslint/interface-name-prefix */
import { Schema, Model, Document, model, VirtualType } from "mongoose";
import logger from "../util/logger";
import * as counterModel from "./Counter";
import { LOCAL_DOMAIN } from "../util/secrets";

export const SHORT_URL_COLLECTION_NAME = "shorturls";
export const MAX_SHORT_COUNT_NUM = Math.pow(62, 8);
export const INIT_COUNTER_VALUE: number = Math.pow(62, 4);

const shortUrlSchema = new Schema({
    shortKeyId: Number,
    shortKeyCode: String,
    hash: String,
    normalUrl: String,
}, { timestamps: true, collection: SHORT_URL_COLLECTION_NAME });

shortUrlSchema.virtual("shortUrl").get(function () {
    return `${LOCAL_DOMAIN}/s/${this.shortKeyCode}`;
});

shortUrlSchema.index({ "shortKeyCode": "hash" });
shortUrlSchema.index({ "hash": "hash" });

/**
 * This is not a magic number, just give some temperature for cold start 
 */

counterModel.initStartNumber(SHORT_URL_COLLECTION_NAME, INIT_COUNTER_VALUE);

export interface IShortURL {
    shortKeyId: number;
    shortKeyCode: string;
    hash: string;
    normalUrl: string;
}

export type IShortURLDocument = IShortURL & Document;

const ShortUrlModel: Model<IShortURLDocument> = model<IShortURLDocument>("ShortUrl", shortUrlSchema);

export const getByhash = async function (hash: string): Promise<IShortURLDocument> {
    const result: IShortURLDocument = await ShortUrlModel.findOne({ hash: hash });
    return result && result.toObject({ virtuals: true }) || null;
};

export const create = async function (doc: IShortURL): Promise<IShortURLDocument> {
    const result: IShortURLDocument = await ShortUrlModel.create(doc);
    logger.info("create result", result);
    return result && result.toObject({ virtuals: true }) || null;
};

export const getByCode = async function (code: string): Promise<IShortURLDocument> {
    const result: IShortURLDocument = await ShortUrlModel.findOne({ shortKeyCode: code });
    logger.info("getByCode return", result && result.toObject());
    return result && result.toObject({ virtuals: true }) || null;
};
