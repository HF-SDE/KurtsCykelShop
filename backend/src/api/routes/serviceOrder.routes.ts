import * as servicePartsUsedController from "@controllers/ServicePartsUsed.controller";
import * as serviceOrderController from "@controllers/serviceOrder.controller";
import * as serviceRepairController from "@controllers/serviceRepair.controller";
import { verifyJWT } from "@middlewares/authenticate.mw";
import { Router } from "express";

const router = Router();

router.use("/", verifyJWT);

// Service order routes
// router.get("/", verifyJWT, serviceOrderController.getAllServiceOrders);
router.get("/paginated", serviceOrderController.getAllServiceOrdersPaginated);
router.get("/:id", serviceOrderController.getServiceOrderById);
router.patch("/:id", serviceOrderController.updateServiceOrder);

// Service repair routes (nested under service orders)
router.post("/:serviceOrderId/repairs", serviceRepairController.createServiceRepair);

// Service parts used routes (nested under service orders)
router.post("/:serviceOrderId/parts", servicePartsUsedController.createServicePartUsed);

export default router;
