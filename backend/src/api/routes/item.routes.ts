import {
  createOne,
  deleteOne,
  getAllPublic,
  getAll,
  getAllPaginated,
  getByBarcode,
  getById,
  getBySearchQuery,
  updateOne,
} from "@controllers/item.controller";
import { verifyJWT } from "@middlewares/authenticate.mw";
import { isAllowed } from "@middlewares/isAllowed.mw";
import { Router } from "express";

const router = Router();

router.get("/public", getAllPublic);

router.use("/", verifyJWT);

router.get("/paginated", isAllowed(["storage:item:view"]), getAllPaginated);
router.get("/barcode", isAllowed(["storage:item:view"]), getByBarcode);
router.get("/search", isAllowed(["storage:item:view"]), getBySearchQuery);
router.get("/:id", isAllowed(["storage:item:view"]), getById);
router.get("/", isAllowed(["storage:item:view"]), getAll);
router.post("/", isAllowed(["storage:item:create"]), createOne);
router.put("/:id", isAllowed(["storage:item:update"]), updateOne);
router.delete("/:id", isAllowed(["storage:item:delete"]), deleteOne);

export { router as itemRoutes };
