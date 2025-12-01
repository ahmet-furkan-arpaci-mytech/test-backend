import type { Express, Router } from "express";

/**
 * Describes the routers that make up the HTTP surface and can be registered
 * once the application is wired.
 */
export interface AppRouterMap {
  user: Router;
  news: Router;
  category: Router;
  savedNews: Router;
  twitter: Router;
  sources: Router;
  docs: Router;
}

export interface AppContainer {
  app: Express;
  routers: AppRouterMap;
}
