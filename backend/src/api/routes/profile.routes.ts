import * as ProfileController from "@controllers/profile.controller";
import { verifyJWT } from "@middlewares/authenticate.mw";
import { Router } from "express";

const router = Router();
router.put("/reset", verifyJWT, ProfileController.changePassword);

router.get("/", verifyJWT, ProfileController.getProfile);

export default router;
