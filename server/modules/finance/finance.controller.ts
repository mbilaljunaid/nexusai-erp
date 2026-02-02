import { Request, Response } from "express";
import { financeService } from "./finance.service";
import { insertGlJournalSchema, insertGlJournalLineSchema, insertCashBankAccountSchema } from "@shared/schema";
import { z } from "zod";

export class FinanceController {

    // ==============================================================================
    // 1. GENERAL LEDGER (GL) HANDLERS
    // ==============================================================================

    // ----- Master Data -----

    async getAccounts(req: Request, res: Response) {
        try {
            const accounts = await financeService.listAccounts();
            res.json(accounts);
        } catch (error: any) {
            res.status(500).json({ error: "Failed to list GL accounts" });
        }
    }

    async createAccount(req: Request, res: Response) {
        try {
            // Note: Schema validation ideally centralized or inline here
            const account = await financeService.createAccount(req.body);
            res.status(201).json(account);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ----- Journals -----

    async getJournals(req: Request, res: Response) {
        try {
            const filters = {
                status: req.query.status as string,
                ledgerId: req.query.ledgerId as string,
                search: req.query.search as string,
                periodId: req.query.periodId as string,
                limit: req.query.limit ? Number(req.query.limit) : undefined,
                offset: req.query.offset ? Number(req.query.offset) : undefined
            };
            const journals = await financeService.listJournals(filters);
            res.json(journals);
        } catch (error: any) {
            res.status(500).json({ error: "Failed to list journals" });
        }
    }

    async createJournal(req: Request, res: Response) {
        try {
            const schema = z.object({
                journal: insertGlJournalSchema,
                lines: z.array(insertGlJournalLineSchema.omit({ journalId: true }))
            });

            const { journal, lines } = schema.parse(req.body);
            const userId = (req.user as any)?.id || "system";

            const result = await financeService.createJournal(journal, lines, userId);
            res.status(201).json(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: error.errors });
            }
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Replaces legacy POST /api/gl/post (Dynamic Forms)
     */
    async createJournalFromForm(req: Request, res: Response) {
        try {
            const { formId, formData, description } = req.body;
            const userId = (req.user as any)?.id || "system";

            const result = await financeService.createJournalFromForm(formId, formData, userId, description);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async postJournal(req: Request, res: Response) {
        try {
            const userId = (req.user as any)?.id || "system";
            const result = await financeService.postJournal(req.params.id, userId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // ----- Period Management -----

    async closePeriod(req: Request, res: Response) {
        try {
            const userId = (req.user as any)?.id || "system";
            const result = await financeService.closePeriod(req.params.id, userId);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ----- Reporting -----

    async getTrialBalance(req: Request, res: Response) {
        try {
            const { ledgerId, periodId } = req.query;
            const report = await financeService.getTrialBalance(ledgerId as string, periodId as string);
            res.json(report);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ==============================================================================
    // 2. BANKING HANDLERS
    // ==============================================================================

    async getBankAccounts(req: Request, res: Response) {
        try {
            const accounts = await financeService.listBankAccounts();
            res.json(accounts);
        } catch (error: any) {
            res.status(500).json({ error: "Failed to list bank accounts" });
        }
    }

    async createBankAccount(req: Request, res: Response) {
        try {
            const data = insertCashBankAccountSchema.parse(req.body);
            const userId = (req.user as any)?.id || "system";
            const account = await financeService.createBankAccount(data, userId);
            res.status(201).json(account);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getCashPosition(req: Request, res: Response) {
        try {
            const position = await financeService.getCashPosition();
            res.json(position);
        } catch (error: any) {
            res.status(500).json({ error: "Failed to get cash position" });
        }
    }

    async importBankStatement(req: Request, res: Response) {
        try {
            // Expecting file content in body or file upload (handled by multer usually)
            // For standardized controller, we assume req.file if using multer, or raw body
            // Here we assume a JSON body with fileContent for simplicity or consistency with legacy wrapper
            const { bankAccountId, fileContent, format } = req.body;

            const result = await financeService.importBankStatement(bankAccountId, fileContent, format);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async autoReconcile(req: Request, res: Response) {
        try {
            const result = await financeService.autoReconcileBankAccount(req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export const financeController = new FinanceController();
