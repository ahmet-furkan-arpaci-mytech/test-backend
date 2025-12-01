import { model } from "mongoose";
import { TwitterAccountSchema } from "../schemas/twitter-account.schema";

export const TwitterAccountModel = model("TwitterAccount", TwitterAccountSchema);
