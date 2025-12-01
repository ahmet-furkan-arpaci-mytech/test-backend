import { Schema } from "mongoose";

export const CategorySchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    colorCode: { type: String, required: true },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);
