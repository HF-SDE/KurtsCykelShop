import * as serviceOrderController from "@controllers/serviceOrder.controller";
import { verifyJWT } from "@middlewares/authenticate.mw";
import { Router } from "express";

const router = Router();

// Service order routes
// router.get("/", verifyJWT, serviceOrderController.getAllServiceOrders);
router.get("/paginated", verifyJWT, serviceOrderController.getAllServiceOrdersPaginated);
router.get("/:id", verifyJWT, serviceOrderController.getServiceOrderById);

export default router;
