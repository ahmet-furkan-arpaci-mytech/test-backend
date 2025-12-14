import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { UserSourceFollowController } from "../controllers/user-source-follow.controller.js";

const wrapAsync =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

export function buildSourceFollowRouter(controller: UserSourceFollowController) {
  const router = Router();
  router.get("/", wrapAsync(controller.getAllSources.bind(controller)));
  router.get(
    "/by-category/:categoryId",
    wrapAsync(controller.getSourcesByCategory.bind(controller))
  );
  router.get("/search", wrapAsync(controller.searchSources.bind(controller)));
  router.get("/followed", wrapAsync(controller.getFollowedSources.bind(controller)));
  router.post(
    "/:sourceId/follow",
    wrapAsync(controller.followSource.bind(controller))
  );
  router.delete(
    "/:sourceId/follow",
    wrapAsync(controller.unfollowSource.bind(controller))
  );
  router.post(
    "/follow/bulk",
    wrapAsync(controller.syncFollowedSources.bind(controller))
  );
  return router;
}
