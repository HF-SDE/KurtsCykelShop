import { getAll, getAllPaginated } from "@controllers/vendor.controller";
import { verifyJWT } from "@middlewares/authenticate.mw";
import { isAllowed } from "@middlewares/isAllowed.mw";
import { Router } from "express";

const router = Router();

router.use("/", verifyJWT);

router.get("/paginated", isAllowed(["storage:vendor:view"]), getAllPaginated);
router.get(["/", "/:id"], isAllowed(["storage:vendor:view"]), getAll);

export { router as vendorRoutes };
