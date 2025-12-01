import { model } from "mongoose";
import { UserSourceFollowSchema } from "../schemas/user-source-follow.schema.js";

export const UserSourceFollowModel = model(
  "UserSourceFollow",
  UserSourceFollowSchema
);
