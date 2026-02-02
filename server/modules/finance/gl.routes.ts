import { Router } from "express";
import { financeController } from "./finance.controller";

const router = Router();

// Master Data
router.get("/accounts", financeController.getAccounts);
router.post("/accounts", financeController.createAccount);

// Journals
router.get("/journals", financeController.getJournals);
router.post("/journals", financeController.createJournal);
router.post("/journals/:id/post", financeController.postJournal);

// Dynamic Forms
router.post("/post", financeController.createJournalFromForm); // Maps to /gl/post

// Period Management
router.post("/periods/:id/close", financeController.closePeriod);

// Reporting
router.get("/trial-balance", financeController.getTrialBalance);

// ... Add other GL routes here as we migrate them

export const glRoutes = router;
