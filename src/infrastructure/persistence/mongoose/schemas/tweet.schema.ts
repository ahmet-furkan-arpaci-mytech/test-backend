import { Schema } from "mongoose";

export const TweetSchema = new Schema(
  {
    _id: { type: String, required: true },
    accountId: { type: String, required: true },
    accountName: { type: String, required: true },
    accountImageUrl: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    isPopular: { type: Boolean, required: true, default: false },
  },
  { timestamps: true, versionKey: false }
);
