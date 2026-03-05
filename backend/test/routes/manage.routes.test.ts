/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import express from "express";
import { NextFunction, Request, Response, Router } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getManageRoutes = async (): Promise<Router> => {
  const module = await import("../../src/api/routes/manage.routes");
  return module.default;
};

const { roleServiceMocks, manageServiceMocks } = vi.hoisted(() => ({
  manageServiceMocks: {
    getUsers: vi.fn(),
    getPermissions: vi.fn(),
    getPermissionGroups: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    resetUserPassword: vi.fn(),
    setUserAccountStatus: vi.fn(),
    patchUser: vi.fn(),
  },
  roleServiceMocks: {
    getRoles: vi.fn(),
    getRole: vi.fn(),
    createRole: vi.fn(),
    updateRole: vi.fn(),
  },
}));

const verifyJWTMock = vi.fn((_req: Request, _res: Response, next: NextFunction) => next());

const validateParamsMock = vi.fn((_req: Request, _res: Response, next: NextFunction) => next());

const isAllowedFactoryMock = vi.fn(() => (_req: Request, _res: Response, next: NextFunction) => next());

vi.mock("../../src/api/services/manage.service", () => manageServiceMocks);
vi.mock("../../src/api/services/role.service", () => roleServiceMocks);

vi.mock("../../src/middleware/authenticate.mw", () => ({
  verifyJWT: verifyJWTMock,
}));

vi.mock("../../src/middleware/validate.mw", () => ({
  validateParams: validateParamsMock,
}));

vi.mock("../../src/middleware/isAllowed.mw", () => ({
  isAllowed: isAllowedFactoryMock,
}));

describe("Manage routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyJWTMock.mockImplementation((_req: Request, _res: Response, next: NextFunction) => next());
    validateParamsMock.mockImplementation((_req: Request, _res: Response, next: NextFunction) => next());
    isAllowedFactoryMock.mockImplementation(() => (_req: Request, _res: Response, next: NextFunction) => next());
    vi.resetModules();
  });

  it("should wire expected manage permissions", async () => {
    await getManageRoutes();

    const permissionsPassed = (isAllowedFactoryMock.mock.calls as unknown[][]).map((call) => call[0]);

    expect(permissionsPassed).toEqual(
      expect.arrayContaining([
        ["administrator:users:view"],
        ["administrator:permission:view"],
        ["administrator:users:create"],
        ["administrator:users:update"],
        ["administrator:role:view"],
        ["administrator:role:create"],
        ["administrator:role:update"],
      ]),
    );
  });

  it("GET /manage/user should enforce auth and call getUsers", async () => {
    const manageRoutes = await getManageRoutes();
    const app = express();

    manageServiceMocks.getUsers.mockResolvedValueOnce({
      status: "Success",
      message: "Users fetched",
      data: [{ id: "u1" }],
    });

    app.use(express.json());
    app.use("/manage", manageRoutes);

    const response = await request(app).get("/manage/user");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Success",
      message: "Users fetched",
      data: [{ id: "u1" }],
    });
    expect(verifyJWTMock).toHaveBeenCalledTimes(1);
    expect(manageServiceMocks.getUsers).toHaveBeenCalledTimes(1);
  });

  it("GET /manage/permission/:id should call validateParams then getPermissions", async () => {
    const manageRoutes = await getManageRoutes();
    const app = express();

    manageServiceMocks.getPermissions.mockResolvedValueOnce({
      status: "Success",
      data: [{ id: "p1", code: "administrator:users:view" }],
    });

    app.use(express.json());
    app.use("/manage", manageRoutes);

    const response = await request(app).get("/manage/permission/0f8fad5b-d9cb-469f-a165-70867728950e");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Success",
      data: [{ id: "p1", code: "administrator:users:view" }],
    });
    expect(validateParamsMock).toHaveBeenCalledTimes(1);
    expect(manageServiceMocks.getPermissions).toHaveBeenCalledTimes(1);
  });

  it("GET /manage/permission should return permissions response", async () => {
    const manageRoutes = await getManageRoutes();
    const app = express();

    manageServiceMocks.getPermissions.mockResolvedValueOnce({
      status: "Success",
      data: [{ id: "p2", code: "administrator:role:view" }],
    });

    app.use(express.json());
    app.use("/manage", manageRoutes);

    const response = await request(app).get("/manage/permission");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Success",
      data: [{ id: "p2", code: "administrator:role:view" }],
    });
    expect(manageServiceMocks.getPermissions).toHaveBeenCalledTimes(1);
  });

  it("GET /manage/permissionGroups should return permission groups", async () => {
    const manageRoutes = await getManageRoutes();
    const app = express();

    manageServiceMocks.getPermissionGroups.mockResolvedValueOnce({
      status: "Success",
      data: [{ id: "pg1", name: "Administration" }],
    });

    app.use(express.json());
    app.use("/manage", manageRoutes);

    const response = await request(app).get("/manage/permissionGroups");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Success",
      data: [{ id: "pg1", name: "Administration" }],
    });
    expect(manageServiceMocks.getPermissionGroups).toHaveBeenCalledTimes(1);
  });

  it("POST /manage/user should map Created to 201", async () => {
    const manageRoutes = await getManageRoutes();
    const app = express();

    manageServiceMocks.createUser.mockResolvedValueOnce({
      status: "Created",
      data: { id: "u2", username: "new-user" },
    });

    app.use(express.json());
    app.use("/manage", manageRoutes);

    const response = await request(app).post("/manage/user").send({ username: "new-user" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      status: "Created",
      data: { id: "u2", username: "new-user" },
    });
    expect(manageServiceMocks.createUser).toHaveBeenCalledTimes(1);
  });

  it("PUT /manage/user/:id should map Updated to 200", async () => {
    const manageRoutes = await getManageRoutes();
    const app = express();

    manageServiceMocks.updateUser.mockResolvedValueOnce({
      status: "Updated",
      data: { id: "u1", firstName: "Taylor" },
    });

    app.use(express.json());
    app.use("/manage", manageRoutes);

    const response = await request(app)
      .put("/manage/user/0f8fad5b-d9cb-469f-a165-70867728950e")
      .send({ firstName: "Taylor" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Updated",
      data: { id: "u1", firstName: "Taylor" },
    });
    expect(manageServiceMocks.updateUser).toHaveBeenCalledTimes(1);
  });

  it("PUT /manage/user/:id/reset-password should call resetUserPassword", async () => {
    const manageRoutes = await getManageRoutes();
    const app = express();

    manageServiceMocks.resetUserPassword.mockResolvedValueOnce({
      status: "Updated",
      message: "Password reset",
    });

    app.use(express.json());
    app.use("/manage", manageRoutes);

    const response = await request(app)
      .put("/manage/user/0f8fad5b-d9cb-469f-a165-70867728950e/reset-password")
      .send({ password: "newpass" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Updated",
      message: "Password reset",
    });
    expect(manageServiceMocks.resetUserPassword).toHaveBeenCalledTimes(1);
  });

  it("PATCH /manage/user/:id should call patchUser", async () => {
    const manageRoutes = await getManageRoutes();
    const app = express();

    manageServiceMocks.patchUser.mockResolvedValueOnce({
      status: "Updated",
      data: { id: "u1", firstName: "Updated" },
    });

    app.use(express.json());
    app.use("/manage", manageRoutes);

    const response = await request(app)
      .patch("/manage/user/0f8fad5b-d9cb-469f-a165-70867728950e")
      .send({ firstName: "Updated" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Updated",
      data: { id: "u1", firstName: "Updated" },
    });
    expect(manageServiceMocks.patchUser).toHaveBeenCalledTimes(1);
  });

  it("PUT /manage/user/:id/account-status should call setUserAccountStatus", async () => {
    const manageRoutes = await getManageRoutes();
    const app = express();

    manageServiceMocks.setUserAccountStatus.mockResolvedValueOnce({
      status: "Updated",
      data: { id: "u1", active: false },
    });

    app.use(express.json());
    app.use("/manage", manageRoutes);

    const response = await request(app)
      .put("/manage/user/0f8fad5b-d9cb-469f-a165-70867728950e/account-status")
      .send({ active: false });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Updated",
      data: { id: "u1", active: false },
    });
    expect(manageServiceMocks.setUserAccountStatus).toHaveBeenCalledTimes(1);
  });

  it("GET /manage/role should return roles list", async () => {
    const manageRoutes = await getManageRoutes();
    const app = express();

    roleServiceMocks.getRoles.mockResolvedValueOnce({
      status: "Success",
      data: [{ id: "r1", name: "admin" }],
    });

    app.use(express.json());
    app.use("/manage", manageRoutes);

    const response = await request(app).get("/manage/role");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Success",
      data: [{ id: "r1", name: "admin" }],
    });
    expect(roleServiceMocks.getRoles).toHaveBeenCalledTimes(1);
  });

  it("GET /manage/role/:id should call validateParams then getRole", async () => {
    const manageRoutes = await getManageRoutes();
    const app = express();

    roleServiceMocks.getRole.mockResolvedValueOnce({
      status: "NotFound",
      message: "Role not found",
    });

    app.use(express.json());
    app.use("/manage", manageRoutes);

    const response = await request(app).get("/manage/role/0f8fad5b-d9cb-469f-a165-70867728950e");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: "NotFound",
      message: "Role not found",
    });
    expect(validateParamsMock).toHaveBeenCalledTimes(1);
    expect(roleServiceMocks.getRole).toHaveBeenCalledTimes(1);
  });

  it("POST /manage/role should map Created to 201", async () => {
    const manageRoutes = await getManageRoutes();
    const app = express();

    roleServiceMocks.createRole.mockResolvedValueOnce({
      status: "Created",
      data: { id: "r2", name: "service" },
    });

    app.use(express.json());
    app.use("/manage", manageRoutes);

    const response = await request(app).post("/manage/role").send({ name: "service" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      status: "Created",
      data: { id: "r2", name: "service" },
    });
    expect(roleServiceMocks.createRole).toHaveBeenCalledTimes(1);
  });

  it("PUT /manage/role/:id should map Updated to 200", async () => {
    const manageRoutes = await getManageRoutes();
    const app = express();

    roleServiceMocks.updateRole.mockResolvedValueOnce({
      status: "Updated",
      data: { id: "r1", name: "administrator" },
    });

    app.use(express.json());
    app.use("/manage", manageRoutes);

    const response = await request(app)
      .put("/manage/role/0f8fad5b-d9cb-469f-a165-70867728950e")
      .send({ name: "administrator" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Updated",
      data: { id: "r1", name: "administrator" },
    });
    expect(roleServiceMocks.updateRole).toHaveBeenCalledTimes(1);
  });

  it("GET /manage/permission/:id should return 400 for invalid UUID", async () => {
    const manageRoutes = await getManageRoutes();
    const app = express();

    validateParamsMock.mockImplementationOnce((req: Request, res: Response) => {
      res.status(400).json({ status: "InvalidDetails", message: "invalid id" }).end();
    });

    app.use(express.json());
    app.use("/manage", manageRoutes);

    const response = await request(app).get("/manage/permission/not-a-uuid");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ status: "InvalidDetails", message: "invalid id" });
    expect(manageServiceMocks.getPermissions).not.toHaveBeenCalled();
  });

  it("GET /manage/user should return 401 when verifyJWT denies", async () => {
    const manageRoutes = await getManageRoutes();
    const app = express();

    verifyJWTMock.mockImplementationOnce((req: Request, res: Response) => {
      res.status(401).json({ status: "Unauthorized", message: "Unauthorized" });
    });

    app.use(express.json());
    app.use("/manage", manageRoutes);

    const response = await request(app).get("/manage/user");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ status: "Unauthorized", message: "Unauthorized" });
    expect(manageServiceMocks.getUsers).not.toHaveBeenCalled();
  });

  it("GET /manage/user should return 403 when isAllowed denies", async () => {
    isAllowedFactoryMock.mockImplementationOnce(
      () => (req: Request, res: Response) => res.status(403).json({ status: "Forbidden", message: "Forbidden" }),
    );

    const manageRoutes = await getManageRoutes();
    const app = express();

    app.use(express.json());
    app.use("/manage", manageRoutes);

    const response = await request(app).get("/manage/user");

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ status: "Forbidden", message: "Forbidden" });
    expect(manageServiceMocks.getUsers).not.toHaveBeenCalled();
  });
});
