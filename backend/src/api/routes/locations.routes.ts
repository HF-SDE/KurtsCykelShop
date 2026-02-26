import { getAll, getAllPaginated } from "@controllers/location.controller";
import { verifyJWT } from "@middlewares/authenticate.mw";
import { isAllowed } from "@middlewares/isAllowed.mw";
import { Router } from "express";

const router = Router();

router.use("/", verifyJWT);

router.get("/paginated", isAllowed(["storage:location:view"]), getAllPaginated);
router.get(["/", "/:id"], isAllowed(["storage:location:view"]), getAll);

export { router as locationRoutes };
