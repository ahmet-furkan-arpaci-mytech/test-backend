import { Router, type Request, type Response, type NextFunction } from "express";
import { CategoryController } from "../controllers/category.controller.js";

const wrapAsync =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

export function buildCategoryRouter(controller: CategoryController) {
  const router = Router();
  router.post("/", wrapAsync(controller.createCategory.bind(controller)));
  router.get("/", wrapAsync(controller.listCategories.bind(controller)));
  router.get(
    "/with-news",
    wrapAsync(controller.listCategoriesWithNews.bind(controller))
  );
  return router;
}
