import * as customerController from "@controllers/customer.controller";
import { verifyJWT } from "@middlewares/authenticate.mw";
import { isAllowed } from "@middlewares/isAllowed.mw";
import { Router } from "express";

const router = Router();

router.use("/", verifyJWT);

router.get("/search", isAllowed(["case:create"]), customerController.searchCustomers);

export default router;
