import { getAllUsers } from "@controllers/users.controller";
import { verifyJWT } from "@middlewares/authenticate.mw";
import { Router } from "express";

const router = Router();

router.get("/", verifyJWT, getAllUsers);

export default router;
