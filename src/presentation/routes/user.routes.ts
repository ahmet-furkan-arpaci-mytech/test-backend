import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { UserController } from "../controllers/user.controller.js";

const wrapAsync =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

export function buildUserRouter(controller: UserController) {
  const router = Router();
  router.post("/", wrapAsync(controller.createUser.bind(controller)));
  router.post("/login", wrapAsync(controller.authenticateUser.bind(controller)));
  router.get("/profile", wrapAsync(controller.getProfile.bind(controller)));
  return router;
}
