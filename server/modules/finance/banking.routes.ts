import { Router } from "express";
import { financeController } from "./finance.controller";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Bank Accounts
router.get("/accounts", financeController.getBankAccounts);
router.post("/accounts", financeController.createBankAccount);

// Cash Position
router.get("/position", financeController.getCashPosition);

// Statement Import
// Legacy accepted file upload or raw body. 
// Standardizing on file upload for this route? 
// Controller expects body fields. Middleware needed to parse file to body if using multer.
// For now, let's map the post directly, assuming controller handles the request logic or we add middleware here.
// Legacy use: router.post("/statements/upload", upload.single("file"), cashService.import...)
router.post("/statements/upload", upload.single("file"), async (req, res, next) => {
    if (req.file) {
        req.body.fileContent = req.file.buffer.toString('utf-8');
    }
    next();
}, financeController.importBankStatement);

// Reconciliation
router.post("/accounts/:id/reconcile", financeController.autoReconcile);

export const bankingRoutes = router;
