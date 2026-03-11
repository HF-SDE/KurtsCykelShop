import { Router } from "express";
import swaggerUi from "swagger-ui-express";

import { openApiDocument } from "../docs/openapi";

const router = Router();

const swaggerHtml = swaggerUi
  .generateHTML(undefined, {
    customCss: "",
    explorer: true,
    swaggerUrl: "docs/openapi.json",
    customSiteTitle: "Kurts Cykel Shop API Docs",
  })
  .replaceAll('href="./', 'href="docs/')
  .replaceAll('src="./', 'src="docs/');

router.use("/", swaggerUi.serveWithOptions({ redirect: false }));

router.get("/", (_req, res) => {
  res.type("html").send(swaggerHtml);
});

router.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});

export default router;
