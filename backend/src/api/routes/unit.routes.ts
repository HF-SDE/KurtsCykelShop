import { getAll } from "@controllers/unit.controller";
import { verifyJWT } from "@middlewares/authenticate.mw";
import { isAllowed } from "@middlewares/isAllowed.mw";
import { Router } from "express";

const router = Router();

router.use("/", verifyJWT);

router.get(["/", "/:id"], isAllowed(["storage:unit:view"]), getAll);

export default router;
