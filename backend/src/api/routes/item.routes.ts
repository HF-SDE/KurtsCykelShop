import { getAll } from "@controllers/item.controller";
import { Router } from "express";

const router = Router();

router.get(["/", "/:id"], getAll);

export default router;
