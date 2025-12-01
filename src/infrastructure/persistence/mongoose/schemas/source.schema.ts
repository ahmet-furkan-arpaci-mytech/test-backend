import { Schema } from "mongoose";

export const SourceSchema = new Schema(
  {
    _id: { type: String, required: true }, // DDD ID — string UUID
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    sourceCategoryId: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);
