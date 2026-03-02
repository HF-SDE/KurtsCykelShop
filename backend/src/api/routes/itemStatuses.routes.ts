import { getAll, getAllPaginated } from "@controllers/itemStatus.controller";
import { verifyJWT } from "@middlewares/authenticate.mw";
import { Router } from "express";

const router = Router();

router.use("/", verifyJWT);

router.get("/paginated", getAllPaginated);
router.get("/", getAll);

export { router as itemStatusRoutes };
