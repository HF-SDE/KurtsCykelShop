import * as servicePartsUsedController from "@controllers/ServicePartsUsed.controller";
import * as serviceOrderController from "@controllers/serviceOrder.controller";
import * as serviceRepairController from "@controllers/serviceRepair.controller";
import { verifyJWT } from "@middlewares/authenticate.mw";
import { Router } from "express";

const router = Router();

// Service order routes
// router.get("/", verifyJWT, serviceOrderController.getAllServiceOrders);
router.get("/paginated", verifyJWT, serviceOrderController.getAllServiceOrdersPaginated);
router.get("/:id", verifyJWT, serviceOrderController.getServiceOrderById);
router.patch("/:id", verifyJWT, serviceOrderController.updateServiceOrder);

// Service repair routes (nested under service orders)
router.post("/:serviceOrderId/repairs", verifyJWT, serviceRepairController.createServiceRepair);

// Service parts used routes (nested under service orders)
router.post("/:serviceOrderId/parts", verifyJWT, servicePartsUsedController.createServicePartUsed);

export default router;
