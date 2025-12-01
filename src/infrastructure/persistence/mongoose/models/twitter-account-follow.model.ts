import { model } from "mongoose";
import { TwitterAccountFollowSchema } from "../schemas/twitter-account-follow.schema";

export const TwitterAccountFollowModel = model(
  "TwitterAccountFollow",
  TwitterAccountFollowSchema
);
