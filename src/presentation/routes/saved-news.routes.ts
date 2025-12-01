import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { SavedNewsController } from "../controllers/saved-news.controller.js";

const wrapAsync =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

export function buildSavedNewsRouter(controller: SavedNewsController) {
  const router = Router();
  router.post("/", wrapAsync(controller.save.bind(controller)));
  router.get(
    "/user/:userId",
    wrapAsync(controller.listByUser.bind(controller))
  );
  router.delete(
    "/:savedNewsId",
    wrapAsync(controller.remove.bind(controller))
  );
  return router;
}
