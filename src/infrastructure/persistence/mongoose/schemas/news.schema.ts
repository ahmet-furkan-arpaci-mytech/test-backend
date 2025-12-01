import { Schema } from "mongoose";

export const NewsSchema = new Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String, required: true },
    categoryId: { type: String, required: true },
    sourceId: { type: String, required: true },
    publishedAt: { type: Date, required: true, default: Date.now },
    isLatest: { type: Boolean, required: true, default: false },
    isPopular: { type: Boolean, required: true, default: false },
  },
  { timestamps: true, versionKey: false }
);
