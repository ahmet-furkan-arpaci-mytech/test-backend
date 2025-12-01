import { Schema } from "mongoose";

export const SavedNewsSchema = new Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    newsId: { type: String, required: true },
    savedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true, versionKey: false }
);
