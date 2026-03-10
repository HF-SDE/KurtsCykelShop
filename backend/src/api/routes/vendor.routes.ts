import { createOne, deleteOne, getAll, getAllPaginated, updateOne } from "@controllers/vendor.controller";
import { verifyJWT } from "@middlewares/authenticate.mw";
import { isAllowed } from "@middlewares/isAllowed.mw";
import { Router } from "express";

const router = Router();

router.use("/", verifyJWT);

router.get("/paginated", isAllowed(["storage:vendor:view"]), getAllPaginated);
router.get("/", isAllowed(["storage:vendor:view"]), getAll);
router.post("/", isAllowed(["storage:vendor:create"]), createOne);
router.put("/:id", isAllowed(["storage:vendor:update"]), updateOne);
router.delete("/:id", isAllowed(["storage:vendor:delete"]), deleteOne);

export { router as vendorRoutes };
