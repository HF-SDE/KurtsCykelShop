/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import express from "express";
import { Router } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthRoutes = async (): Promise<Router> => {
  const module = await import("../../src/api/routes/auth.routes");
  return module.default;
};

const { authServiceMocks } = vi.hoisted(() => ({
  authServiceMocks: {
    login: vi.fn(),
    logout: vi.fn(),
    accessToken: vi.fn(),
    refreshToken: vi.fn(),
  },
}));

vi.mock("../../src/api/services/auth.service", () => authServiceMocks);

describe("Auth routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /login should return mapped status and response body", async () => {
    const authRoutes = await getAuthRoutes();
    const app = express();

    authServiceMocks.login.mockResolvedValueOnce({
      status: "Success",
      message: "ok",
      data: { accessToken: "a", refreshToken: "r" },
    });

    app.use(express.json());
    app.use(authRoutes);

    const response = await request(app)
      .post("/login")
      .set("x-forwarded-for", "127.0.0.9")
      .send({ username: "u", password: "p" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Success",
      message: "ok",
      data: { accessToken: "a", refreshToken: "r" },
    });
    expect(authServiceMocks.login).toHaveBeenCalledWith({ username: "u", password: "p", ip: "127.0.0.9" });
  });

  it("POST /logout should map InvalidCredentials to 401", async () => {
    const authRoutes = await getAuthRoutes();
    const app = express();

    authServiceMocks.logout.mockResolvedValueOnce({
      status: "InvalidCredentials",
      message: "bad token",
    });

    app.use(express.json());
    app.use(authRoutes);

    const response = await request(app).post("/logout").set("x-forwarded-for", "10.0.0.1").send({ token: "t" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: "InvalidCredentials",
      message: "bad token",
    });
    expect(authServiceMocks.logout).toHaveBeenCalledWith({ token: "t", ip: "10.0.0.1" });
  });

  it("POST /accessToken should map Success to 200 with returned payload", async () => {
    const authRoutes = await getAuthRoutes();
    const app = express();

    authServiceMocks.accessToken.mockResolvedValueOnce({
      status: "Success",
      data: { accessToken: "new-access", refreshToken: "new-refresh" },
    });

    app.use(express.json());
    app.use(authRoutes);

    const response = await request(app)
      .post("/accessToken")
      .set("x-forwarded-for", "10.0.0.2")
      .send({ token: "refresh" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Success",
      data: { accessToken: "new-access", refreshToken: "new-refresh" },
    });
    expect(authServiceMocks.accessToken).toHaveBeenCalledWith({ token: "refresh", ip: "10.0.0.2" });
  });

  it("GET /refreshToken should return 400 when auth header is missing", async () => {
    const authRoutes = await getAuthRoutes();
    const app = express();

    app.use(express.json());
    app.use(authRoutes);

    const response = await request(app).get("/refreshToken");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: "MissingData",
      message: "Missing authentication",
    });
    expect(authServiceMocks.refreshToken).not.toHaveBeenCalled();
  });

  it("GET /refreshToken should return 400 when auth header is malformed", async () => {
    const authRoutes = await getAuthRoutes();
    const app = express();

    app.use(express.json());
    app.use(authRoutes);

    const response = await request(app).get("/refreshToken").set("authorization", "Token abc123");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: "MissingData",
      message: "Missing authentication",
    });
    expect(authServiceMocks.refreshToken).not.toHaveBeenCalled();
  });

  it("GET /refreshToken should parse bearer token and return service payload", async () => {
    const authRoutes = await getAuthRoutes();
    const app = express();

    authServiceMocks.refreshToken.mockResolvedValueOnce({
      status: "Success",
      data: { accessToken: "a2", refreshToken: "r2" },
    });

    app.use(express.json());
    app.use(authRoutes);

    const response = await request(app)
      .get("/refreshToken")
      .set("authorization", "Bearer access-token")
      .set("x-forwarded-for", "10.10.10.10");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Success",
      data: { accessToken: "a2", refreshToken: "r2" },
    });
    expect(authServiceMocks.refreshToken).toHaveBeenCalledWith({ token: "access-token", ip: "10.10.10.10" });
  });
});
