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

router.get("/roles", isAllowed(["administrator:roles:view"]), getRoles);
router.get("/roles/:id", isAllowed(["administrator:roles:view"]), validateParams, getRole);
router.post("/roles", isAllowed(["administrator:roles:create"]), createRole);
router.put("/roles/:id", isAllowed(["administrator:roles:update"]), updateRole);

export default router;
