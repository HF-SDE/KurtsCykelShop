import * as servicePartsUsedController from "@controllers/ServicePartsUsed.controller";
import * as serviceOrderController from "@controllers/serviceOrder.controller";
import * as serviceRepairController from "@controllers/serviceRepair.controller";
import { verifyJWT } from "@middlewares/authenticate.mw";
import { isAllowed } from "@middlewares/isAllowed.mw";
import { Router } from "express";

const router = Router();

router.use("/", verifyJWT);
// router.get("/", verifyJWT, serviceOrderController.getAllServiceOrders);
router.get("/paginated", isAllowed(["case:view"]), serviceOrderController.getAllServiceOrdersPaginated);
router.get("/:id", isAllowed(["case:view"]), serviceOrderController.getServiceOrderById);
router.patch("/:id", isAllowed(["case:update"]), serviceOrderController.updateServiceOrder);

// Service repair routes (nested under service orders)
router.post("/:serviceOrderId/repairs", isAllowed(["case:update"]), serviceRepairController.createServiceRepair);

// Service parts used routes (nested under service orders)
router.post(
  "/:serviceOrderId/parts",
  isAllowed(["case:update:items"]),
  servicePartsUsedController.createServicePartUsed,
);

export default router;
