import { UserSchema } from "../schemas/user.schema";
import { model } from "mongoose";

export const UserModel = model("User", UserSchema);
