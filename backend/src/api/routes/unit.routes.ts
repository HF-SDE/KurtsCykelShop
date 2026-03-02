import { createOne, deleteOne, getAll, updateOne } from "@controllers/unit.controller";
import { verifyJWT } from "@middlewares/authenticate.mw";
import { isAllowed } from "@middlewares/isAllowed.mw";
import { Router } from "express";

const router = Router();

router.use("/", verifyJWT);

router.get("/", isAllowed(["storage:unit:view"]), getAll);
router.post("/", isAllowed(["storage:unit:create"]), createOne);
router.put("/:id", isAllowed(["storage:unit:update"]), updateOne);
router.delete("/:id", isAllowed(["storage:unit:delete"]), deleteOne);

export { router as unitRoutes };
