import "dotenv/config";
import "reflect-metadata";

import express, { type Express } from "express";
import mongoose from "mongoose";

import { buildCategoryRouter } from "../presentation/routes/category.routes.js";
import { buildSavedNewsRouter } from "../presentation/routes/saved-news.routes.js";
import { docsRouter } from "../presentation/routes/docs.routes.js";
import { buildNewsRouter } from "../presentation/routes/news.routes.js";
import { buildTwitterRouter } from "../presentation/routes/twitter.routes.js";
import { buildUserRouter } from "../presentation/routes/user.routes.js";
import { buildSourceFollowRouter } from "../presentation/routes/source-follow.routes.js";
import { authMiddleware } from "../presentation/middlewares/auth.middleware.js";
import { globalErrorHandler } from "../presentation/middlewares/global-error-handler.js";
import { httpLogger } from "../presentation/middlewares/http-logger.js";
import { apiKeyMiddleware } from "../presentation/middlewares/api-key.middleware.js";
import { TkMessage } from "../infrastructure/utils/tk-message.js";
import { CategoryController } from "../presentation/controllers/category.controller.js";
import { NewsController } from "../presentation/controllers/news.controller.js";
import { TwitterController } from "../presentation/controllers/twitter.controller.js";
import { UserController } from "../presentation/controllers/user.controller.js";
import { UserSourceFollowController } from "../presentation/controllers/user-source-follow.controller.js";
import { SavedNewsController } from "../presentation/controllers/saved-news.controller.js";
import { AppContainer, AppRouterMap } from "./container/types.js";
import { container as diContainer } from "./container/inversify.config.js";

const API_PREFIX = process.env.API_PREFIX ?? "/api/v1";
const DEFAULT_MONGO_URI = "mongodb://localhost:27017/news-backend";
const MONGO_URI = process.env.MONGO_URI ?? DEFAULT_MONGO_URI;
const PORT = Number(process.env.PORT ?? 4000);

function buildRouterMap(): AppRouterMap {
  const userController = diContainer.get(UserController);
  const newsController = diContainer.get(NewsController);
  const categoryController = diContainer.get(CategoryController);
  const savedNewsController = diContainer.get(SavedNewsController);
  const twitterController = diContainer.get(TwitterController);
  const userSourceFollowController = diContainer.get(UserSourceFollowController);

  return {
    user: buildUserRouter(userController),
    news: buildNewsRouter(newsController, categoryController),
    category: buildCategoryRouter(categoryController),
    savedNews: buildSavedNewsRouter(savedNewsController),
    twitter: buildTwitterRouter(twitterController),
    docs: docsRouter,
    sources: buildSourceFollowRouter(userSourceFollowController),
  };
}

function buildContainer(): AppContainer {
  return {
    app: express(),
    routers: buildRouterMap(),
  };
}

function registerRoutes(app: Express, routers: AppRouterMap): void {
  app.use(`${API_PREFIX}/users`, routers.user);
  app.use(`${API_PREFIX}/news`, routers.news);
  app.use(`${API_PREFIX}/categories`, routers.category);
  app.use(`${API_PREFIX}/saved-news`, routers.savedNews);
  app.use(`${API_PREFIX}/twitter`, routers.twitter);
  app.use(`${API_PREFIX}/sources`, routers.sources);
  app.use("/docs", routers.docs);
}

function configureApp(container: AppContainer): Express {
  const { app, routers } = container;
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(httpLogger);
  app.use(apiKeyMiddleware);
  app.use(authMiddleware);

  registerRoutes(app, routers);
  app.use(globalErrorHandler);

  return app;
}

function connectDatabase(uri: string): Promise<void> {
  return mongoose.connect(uri).then(() => {
    TkMessage.info(`MongoDB connected at ${uri}`);
  });
}

const appContainer: AppContainer = buildContainer();
export const app = configureApp(appContainer);

export function startServer(): Promise<void> {
  return connectDatabase(MONGO_URI).then(
    () =>
      new Promise<void>((resolve, reject) => {
        const server = app.listen(PORT, () => {
          TkMessage.success(`Server listening on http://localhost:${PORT}`);
          resolve();
        });
        server.on("error", reject);
      })
  );
}

if (process.env.NODE_ENV !== "test") {
  startServer().catch((error) => {
    TkMessage.error(
      error instanceof Error
        ? error.message
        : "Failed to start the application."
    );
    process.exit(1);
  });
}
