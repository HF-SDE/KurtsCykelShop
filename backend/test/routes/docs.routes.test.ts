import express from "express";
import { Router } from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

const getDocsRoutes = async (): Promise<Router> => {
  const module = await import("../../src/api/routes/docs.routes");
  return module.default;
};

describe("Docs routes", () => {
  it("GET /docs should return swagger UI without redirecting", async () => {
    const docsRoutes = await getDocsRoutes();
    const app = express();

    app.use("/docs", docsRoutes);

    const response = await request(app).get("/docs");

    expect(response.status).toBe(200);
    expect(response.headers.location).toBeUndefined();
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.text).toContain('src="docs/swagger-ui-bundle.js"');
    expect(response.text).toContain('src="docs/swagger-ui-init.js"');
    expect(response.text).toContain('href="docs/swagger-ui.css"');
  });

  it("GET /docs/openapi.json should expose the OpenAPI document", async () => {
    const docsRoutes = await getDocsRoutes();
    const app = express();

    app.use("/docs", docsRoutes);

    const response = await request(app).get("/docs/openapi.json");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.body.openapi).toBe("3.0.3");
    expect(response.body.servers).toEqual([{ url: "..", description: "Parent path of the docs endpoint" }]);
    expect(response.body.paths["/health"]).toBeDefined();
    expect(response.body.paths["/manage/user"]).toBeDefined();
  });

  it("GET /docs/swagger-ui.css should serve the UI asset without redirecting", async () => {
    const docsRoutes = await getDocsRoutes();
    const app = express();

    app.use("/docs", docsRoutes);

    const response = await request(app).get("/docs/swagger-ui.css");

    expect(response.status).toBe(200);
    expect(response.headers.location).toBeUndefined();
    expect(response.headers["content-type"]).toContain("text/css");
  });

  it("GET /docs/swagger-ui-init.js should point Swagger UI at the local OpenAPI JSON", async () => {
    const docsRoutes = await getDocsRoutes();
    const app = express();

    app.use("/docs", docsRoutes);

    const response = await request(app).get("/docs/swagger-ui-init.js");

    expect(response.status).toBe(200);
    expect(response.headers.location).toBeUndefined();
    expect(response.headers["content-type"]).toContain("application/javascript");
    expect(response.text).toContain("docs/openapi.json");
  });
});
