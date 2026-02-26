import {
  createOne,
  deleteOne,
  getAll,
  getAllPaginated,
  getByBarcode,
  getById,
  getBySearchQuery,
  updateOne,
} from "@controllers/item.controller";
import { Router } from "express";

const router = Router();

router.get("/paginated", getAllPaginated);
router.get("/barcode", getByBarcode);
router.get("/search", getBySearchQuery);
router.get("/:id", getById);
router.get("/", getAll);
router.post("/", createOne);
router.put("/:id", updateOne);
router.delete("/:id", deleteOne);

export { router as itemRoutes };
