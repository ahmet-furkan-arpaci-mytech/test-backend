import { Schema } from "mongoose";

export const TwitterAccountFollowSchema = new Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    accountId: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);
