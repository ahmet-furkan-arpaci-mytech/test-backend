import { CategorySchema } from "../schemas/category.schema";
import { model } from "mongoose";

export const CategoryModel = model("Category", CategorySchema);
