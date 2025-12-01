import { SourceCategorySchema } from "../schemas/source-category.schema";
import { model } from "mongoose";

export const SourceCategoryModel = model("SourceCategory", SourceCategorySchema);
