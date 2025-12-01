import { SourceSchema } from "../schemas/source.schema";
import { model } from "mongoose";

export const SourceModel = model("Source", SourceSchema);
