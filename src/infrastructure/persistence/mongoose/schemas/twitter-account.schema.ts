import { Schema } from "mongoose";

export const TwitterAccountSchema = new Schema(
  {
    _id: { type: String, required: true },
    handle: { type: String, required: true },
    displayName: { type: String, required: true },
    imageUrl: { type: String, required: true },
    bio: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true, versionKey: false }
);
