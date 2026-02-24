import { createOne, getAll, getAllPaginated, updateOne } from "@controllers/item.controller";
import { Router } from "express";

const router = Router();

router.get("/paginated", getAllPaginated);
router.get(["/", "/:id"], getAll);
router.post("/", createOne);
router.put("/:id", updateOne);

export { router as itemRoutes };
