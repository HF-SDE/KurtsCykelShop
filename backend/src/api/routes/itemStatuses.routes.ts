import { getAll, getAllPaginated } from "@controllers/itemStatus.controller";
import { Router } from "express";

const router = Router();

router.get("/paginated", getAllPaginated);
router.get(["/", "/:id"], getAll);

export { router as itemStatusRoutes };
