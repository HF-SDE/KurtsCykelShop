import {
  createUser,
  getPermissionGroups,
  getPermissions,
  getUsers,
  patchUser,
  updateUser,
} from "@controllers/manage.controller";
import { createRole, getRole, getRoles, updateRole } from "@controllers/role.controller";
import { verifyJWT } from "@middlewares/authenticate.mw";
import { isAllowed } from "@middlewares/isAllowed.mw";
import { validateParams } from "@middlewares/validate.mw";
import { Router } from "express";

const router = Router();

router.use("/", verifyJWT);

router.get("/user", isAllowed(["administrator:users:view"]), getUsers);
router.get(
  ["/permission", "/permission/:id"],
  isAllowed(["administrator:permission:view"]),
  validateParams,
  getPermissions,
);
router.get("/permissionGroups", isAllowed(["administrator:permission:view"]), validateParams, getPermissionGroups);

router.post("/user", isAllowed(["administrator:users:create"]), createUser);
router.put("/user/:id", isAllowed(["administrator:users:update"]), updateUser);
router.patch("/user/:id", isAllowed(["administrator:users:update"]), patchUser);

router.get("/role", isAllowed(["administrator:role:view"]), getRoles);
router.get("/role/:id", isAllowed(["administrator:role:view"]), validateParams, getRole);
router.post("/role", isAllowed(["administrator:role:create"]), createRole);
router.put("/role/:id", isAllowed(["administrator:role:update"]), updateRole);

export default router;
