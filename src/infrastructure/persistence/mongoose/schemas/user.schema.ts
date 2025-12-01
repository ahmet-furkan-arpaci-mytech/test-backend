import { Schema } from "mongoose";

export const UserSchema = new Schema(
  {
    _id: { type: String, required: true }, // DDD ID - string UUID
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);
