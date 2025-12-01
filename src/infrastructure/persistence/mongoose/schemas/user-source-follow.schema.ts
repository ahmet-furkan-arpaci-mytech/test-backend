import { Schema } from "mongoose";

export const UserSourceFollowSchema = new Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    sourceId: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);
