import { NewsSchema } from "../schemas/news.schema";
import { model } from "mongoose";

export const NewsModel = model("News", NewsSchema);
