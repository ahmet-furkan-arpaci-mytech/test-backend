import { Router } from "express";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "../swagger.js";

const router = Router();

router.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

export { router as docsRouter };
