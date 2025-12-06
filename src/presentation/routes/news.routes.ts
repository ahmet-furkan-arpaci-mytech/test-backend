import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { NewsController } from "../controllers/news.controller.js";
import { CategoryController } from "../controllers/category.controller.js";

const wrapAsync =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

export function buildNewsRouter(
  newsController: NewsController,
  categoryController: CategoryController
) {
  const router = Router();
  router.get("/", wrapAsync(newsController.listNews.bind(newsController)));
  router.get(
    "/categories",
    wrapAsync(categoryController.listCategories.bind(categoryController))
  );
  router.get(
    "/category/:categoryId",
    wrapAsync(newsController.listNewsByCategory.bind(newsController))
  );
  return router;
}
