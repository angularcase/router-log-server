import { Schema } from "mongoose";

export const DeviceSchema = new Schema({
    mac: { type: String, required: true },
    state: { type: Boolean, required: true },
    date: { type: String, required: true },
});