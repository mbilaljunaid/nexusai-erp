import { Router } from "express";
import { scmController } from "./scm.controller";
import { wmsRouter } from "../inventory/routes";
import { enforceRBAC } from "../../middleware/auth"; // Adjust path if needed

export const scmRoutes = Router();

// ==========================
// PROCUREMENT
// ==========================
// /api/scm/procurement/*

const procurementRouter = Router();
procurementRouter.get("/purchase-orders", scmController.getPurchaseOrders);
procurementRouter.post("/purchase-orders", scmController.createPurchaseOrder);
scmRoutes.use("/procurement", procurementRouter);


// ==========================
// SOURCING
// ==========================
// /api/scm/sourcing/*

const sourcingRouter = Router();
sourcingRouter.get("/rfqs", scmController.listRfqs);
sourcingRouter.post("/rfqs", scmController.createRfq);
sourcingRouter.post("/rfqs/:id/publish", scmController.publishRfq);
scmRoutes.use("/sourcing", sourcingRouter);


// ==========================
// WMS
// ==========================
// /api/scm/wms/*

scmRoutes.use("/wms", wmsRouter);


export default scmRoutes;
