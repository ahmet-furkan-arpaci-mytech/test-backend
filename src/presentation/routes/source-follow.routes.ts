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
  router.get("/followed", wrapAsync(controller.getFollowedSources.bind(controller)));
  router.put(
    "/followed",
    wrapAsync(controller.updateMyFollowedSources.bind(controller))
  );
  router.delete(
    "/followed",
    wrapAsync(controller.clearFollowedSources.bind(controller))
  );
  return router;
}
