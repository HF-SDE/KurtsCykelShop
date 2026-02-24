import {
  createUser,
  getPermissionGroups,
  getPermissions,
  getUsers,
  patchUser,
  updateUser,
} from "@controllers/manage.controller";
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

export default router;
