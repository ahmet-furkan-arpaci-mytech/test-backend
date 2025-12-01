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
  router.get("/accounts", wrapAsync(controller.listAccounts.bind(controller)));
  router.post(
    "/accounts",
    wrapAsync(controller.createAccount.bind(controller))
  );
  router.get("/tweets", wrapAsync(controller.listTweets.bind(controller)));
  router.get(
    "/accounts/followed",
    wrapAsync(controller.listFollowedAccounts.bind(controller))
  );
  router.post(
    "/accounts/:accountId/follow",
    wrapAsync(controller.followAccount.bind(controller))
  );
  router.delete(
    "/accounts/:accountId/follow",
    wrapAsync(controller.unfollowAccount.bind(controller))
  );
  return router;
}
