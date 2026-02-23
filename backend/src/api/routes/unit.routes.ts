import { getAll } from "@controllers/unit.controller";
import { Router } from "express";

const router = Router();

router.get(["/", "/:id"], getAll);

export default router;
