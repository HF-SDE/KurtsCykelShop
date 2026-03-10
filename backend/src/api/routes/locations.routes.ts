import { createOne, deleteOne, getAll, getAllPaginated, updateOne } from "@controllers/location.controller";
import { verifyJWT } from "@middlewares/authenticate.mw";
import { isAllowed } from "@middlewares/isAllowed.mw";
import { Router } from "express";

const router = Router();

router.use("/", verifyJWT);

router.get("/paginated", isAllowed(["storage:location:view"]), getAllPaginated);
router.get("/", isAllowed(["storage:location:view"]), getAll);
router.post("/", isAllowed(["storage:location:create"]), createOne);
router.put("/:id", isAllowed(["storage:location:update"]), updateOne);
router.delete("/:id", isAllowed(["storage:location:delete"]), deleteOne);

export { router as locationRoutes };
