/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import express from "express";
import { NextFunction, Request, Response, Router } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getUserRoutes = async (): Promise<Router> => {
  const module = await import("../../src/api/routes/user.routes");
  return module.default;
};

const { userServiceMocks, verifyJWTMock } = vi.hoisted(() => ({
  userServiceMocks: {
    getAllUsers: vi.fn(),
  },
  verifyJWTMock: vi.fn((_req: Request, _res: Response, next: NextFunction) => next()),
}));

vi.mock("../../src/api/services/user.service", () => userServiceMocks);

vi.mock("../../src/middleware/authenticate.mw", () => ({
  verifyJWT: verifyJWTMock,
}));

describe("User routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyJWTMock.mockImplementation((_req: Request, _res: Response, next: NextFunction) => next());
    vi.resetModules();
  });

  it("GET /user should return 200 with success payload", async () => {
    const userRoutes = await getUserRoutes();
    const app = express();

    userServiceMocks.getAllUsers.mockResolvedValueOnce([[{ id: "u1", username: "alpha" }], null]);

    app.use(express.json());
    app.use("/user", userRoutes);

    const response = await request(app).get("/user");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Success",
      message: "Users retrieved successfully",
      data: [{ id: "u1", username: "alpha" }],
    });
    expect(verifyJWTMock).toHaveBeenCalledTimes(1);
    expect(userServiceMocks.getAllUsers).toHaveBeenCalledTimes(1);
  });

  it("GET /user should return 500 with error payload when service fails", async () => {
    const userRoutes = await getUserRoutes();
    const app = express();

    userServiceMocks.getAllUsers.mockResolvedValueOnce([null, { status: "Failed", message: "db down" }]);

    app.use(express.json());
    app.use("/user", userRoutes);

    const response = await request(app).get("/user");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: "Failed",
      message: "db down",
    });
    expect(verifyJWTMock).toHaveBeenCalledTimes(1);
    expect(userServiceMocks.getAllUsers).toHaveBeenCalledTimes(1);
  });

  it("GET /user should return 401 when verifyJWT denies", async () => {
    const userRoutes = await getUserRoutes();
    const app = express();

    verifyJWTMock.mockImplementationOnce((req: Request, res: Response) => {
      res.status(401).json({ status: "Unauthorized", message: "Unauthorized" });
    });

    app.use(express.json());
    app.use("/user", userRoutes);

    const response = await request(app).get("/user");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ status: "Unauthorized", message: "Unauthorized" });
    expect(userServiceMocks.getAllUsers).not.toHaveBeenCalled();
  });
});
