import { Schema, Model, Document, model } from "mongoose";


const CounterSchema = new Schema({
    count: Number,
    collectionName: String,
}, { timestamps: true });

CounterSchema.index({ "collection": "hash" });


export interface CounterDocument extends Document {
    count: number;
    collectionName: string;
}


const CounterModel: Model<CounterDocument> = model<CounterDocument>("Counter", CounterSchema);

export async function getNextId(collection: string): Promise<CounterDocument> {
    const c: CounterDocument = await CounterModel.findOneAndUpdate(
        { collectionName: collection },
        { $inc: { count: 1 }, $setOnInsert: { createdAt: new Date() }, $set: {} },
        { new: true, upsert: true }).exec();

    return c.toObject();
}

export async function initStartNumber(collection: string, initNum: number): Promise<CounterDocument> {
    const c: CounterDocument = await CounterModel.findOneAndUpdate(
        { collectionName: collection },
        { $setOnInsert: { createdAt: new Date(), count: initNum } },
        { new: true, upsert: true }).exec();

    return c.toObject();
}