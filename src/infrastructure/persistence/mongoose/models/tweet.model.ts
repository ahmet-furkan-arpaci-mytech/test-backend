import { TweetSchema } from "../schemas/tweet.schema";
import { model } from "mongoose";

export const TweetModel = model("Tweet", TweetSchema);
