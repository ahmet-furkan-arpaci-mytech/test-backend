import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { TwitterController } from "../controllers/twitter.controller.js";

const wrapAsync =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

export function buildTwitterRouter(controller: TwitterController) {
  const router = Router();
  router.get("/tweets", wrapAsync(controller.listTweets.bind(controller)));
  return router;
}
