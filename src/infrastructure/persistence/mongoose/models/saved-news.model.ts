import { SavedNewsSchema } from "../schemas/saved-news.schema";
import { model } from "mongoose";

export const SavedNewsModel = model("SavedNews", SavedNewsSchema);
