import { Request, Response } from "express";
import { db } from "../../db";
import { slaEventClasses, slaEventTypes, slaJournalLineTypes, slaJournalHeaders, slaMappingSets, slaMappingSetValues } from "../../../shared/schema/sla";
import { eq } from "drizzle-orm";

export class SlaController {

    // Get all Event Classes (e.g. AP Invoice, AR Invoice)
    async getEventClasses(req: Request, res: Response) {
        try {
            const classes = await db.select().from(slaEventClasses);
            res.json(classes);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch Event Classes" });
        }
    }

    // Get Event Types for a Class
    async getEventTypes(req: Request, res: Response) {
        try {
            const { classId } = req.params;
            const types = await db.select().from(slaEventTypes)
                .where(eq(slaEventTypes.eventClassId, classId));
            res.json(types);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch Event Types" });
        }
    }

    // Get JLTs (Journal Line Types) for a Class
    async getJournalLineTypes(req: Request, res: Response) {
        try {
            const { classId } = req.params;
            const jlts = await db.select().from(slaJournalLineTypes)
                .where(eq(slaJournalLineTypes.eventClassId, classId));
            res.json(jlts);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch JLTs" });
        }
    }

    // Create/Update JLT
    async upsertJournalLineType(req: Request, res: Response) {
        try {
            const data = req.body;
            // validation skipped for MVP
            const [jlt] = await db.insert(slaJournalLineTypes)
                .values(data)
                .onConflictDoUpdate({
                    target: slaJournalLineTypes.id,
                    set: data
                })
                .returning();
            res.json(jlt);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to save JLT" });
        }
    }

    // Get Accounting for Transaction
    async getAccounting(req: Request, res: Response) {
        try {
            const { entityId } = req.params;
            // Fetch Header
            const header = await db.query.slaJournalHeaders.findFirst({
                where: eq(slaJournalHeaders.entityId, entityId),
                with: {
                    lines: {
                        with: {
                            codeCombination: true
                        },
                        orderBy: (lines, { asc }) => [asc(lines.lineNumber)]
                    }
                }
            });

            if (!header) {
                return res.json({ message: "No accounting found", found: false });
            }

            res.json({ ...header, found: true });
        } catch (error) {
            console.error("Error fetching SLA accounting:", error);
            res.status(500).json({ error: "Failed to fetch accounting data" });
        }
    }

    // --- Accounting Rules (ADR) ---

    // Get All Accounting Rules
    async getAccountingRules(req: Request, res: Response) {
        try {
            const rules = await db.select().from(require("../../../shared/schema/sla").slaAccountingRules);
            res.json(rules);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch Accounting Rules" });
        }
    }

    // Upsert Accounting Rule
    async upsertAccountingRule(req: Request, res: Response) {
        try {
            const data = req.body;
            const slaAccountingRules = require("../../../shared/schema/sla").slaAccountingRules;

            const [rule] = await db.insert(slaAccountingRules)
                .values(data)
                .onConflictDoUpdate({
                    target: slaAccountingRules.id,
                    set: data
                })
                .returning();

            // Audit Log
            const { slaAuditService } = require("./sla-audit.service");
            await slaAuditService.logConfigChange("UPDATE", "SLA_RULE", rule.id, null, data, "admin"); // MVP: old val null

            res.json(rule);
        } catch (error) {
            console.error("Error saving ADR:", error);
            res.status(500).json({ error: "Failed to save Accounting Rule" });
        }
    }

    // Delete Accounting Rule
    async deleteAccountingRule(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const slaAccountingRules = require("../../../shared/schema/sla").slaAccountingRules;

            await db.delete(slaAccountingRules)
                .where(eq(slaAccountingRules.id, id));

            // Audit Log
            const { slaAuditService } = require("./sla-audit.service");
            await slaAuditService.logConfigChange("DELETE", "SLA_RULE", id, null, null, "admin");

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: "Failed to delete Accounting Rule" });
        }
    }

    // --- Mapping Sets ---
    async getMappingSets(req: Request, res: Response) {
        try {
            const result = await db.select().from(slaMappingSets);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch Mapping Sets" });
        }
    }

    async upsertMappingSet(req: Request, res: Response) {
        try {
            const data = req.body;
            const [record] = await db.insert(slaMappingSets)
                .values(data)
                .onConflictDoUpdate({ target: slaMappingSets.id, set: data })
                .returning();
            res.json(record);
        } catch (error) {
            res.status(500).json({ error: "Failed to save Mapping Set" });
        }
    }

    async getMappingSetValues(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const values = await db.select().from(slaMappingSetValues)
                .where(eq(slaMappingSetValues.mappingSetId, id));
            res.json(values);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch Mapping Values" });
        }
    }

    async upsertMappingSetValues(req: Request, res: Response) {
        try {
            const { id } = req.params; // mappingSetId
            const values = req.body; // Array of values

            // Allow bulk replace or upsert. For simplicity, delete and insert for full sync
            // Or simple upsert loop.
            // Requirement is just to save. Let's assume single Upsert or Bulk Replace.
            // Let's implement single upsert if body is object, or bulk if array.

            if (Array.isArray(values)) {
                // Bulk Replace strategy for MVP
                await db.delete(slaMappingSetValues).where(eq(slaMappingSetValues.mappingSetId, id));
                if (values.length > 0) {
                    const toInsert = values.map(v => ({ ...v, mappingSetId: id }));
                    await db.insert(slaMappingSetValues).values(toInsert);
                }
                res.json({ success: true, count: values.length });
            } else {
                // Single Upsert
                const [record] = await db.insert(slaMappingSetValues)
                    .values({ ...values, mappingSetId: id })
                    .onConflictDoUpdate({ target: slaMappingSetValues.id, set: values })
                    .returning();
                res.json(record);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to save Mapping Values" });
        }
    }

    // --- GL Transfer ---
    async transferToGl(req: Request, res: Response) {
        try {
            const { ledgerId } = req.body;
            // Lazy import to avoid circular dependency issues if any
            const { glTransferService } = require("../../services/GlTransferService");

            const result = await glTransferService.transferToGl(ledgerId || "PRIMARY");
            res.json(result);
        } catch (error) {
            console.error("GL Transfer failed:", error);
            res.status(500).json({ error: "Failed to transfer to GL" });
        }
    }

    // --- AI Explainability ---
    async explainAccounting(req: Request, res: Response) {
        try {
            let payload = req.body;

            // Reconstruct Payload if only entityId/Table provided
            if (!payload.sourceData && payload.entityId && payload.entityTable) {
                payload = await slaController.reconstructPayload(payload);
            }

            // Lazy import
            const { slaEngine } = require("./sla.service");

            const trace = await slaEngine.explainAccounting(payload);
            res.json(trace);
        } catch (error: any) {
            console.error("Explain failed:", error);
            res.status(500).json({ error: error.message || "Failed to generate trace" });
        }
    }

    // --- Manual Journals (Phase 17) ---
    async createManualJournal(req: Request, res: Response) {
        try {
            const data = req.body;
            // Lazy import
            const { slaEngine } = require("./sla.service");

            // Simple validation
            if (!data.ledgerId || !data.lines || data.lines.length < 2) {
                return res.status(400).json({ error: "Invalid payload: Ledger and at least 2 lines required." });
            }

            const header = await slaEngine.createManualJournal(data);
            res.json(header);
        } catch (error: any) {
            console.error("Manual Journal failed:", error);
            res.status(400).json({ error: error.message || "Failed to create Manual Journal" });
        }
    }

    async getAccountAnalysis(req: Request, res: Response) {
        try {
            const { ledgerId, periodName, segment1, segment3 } = req.body; // Use POST for filter payload or GET query params. Using POST for now as per React Query usage
            // Wait, standard GET query params usually better for reports, but body easier for complex filters.

            const results = await require("./sla.reporting.service").slaReportingService.getAccountAnalysis({
                ledgerId, periodName, segment1, segment3
            });
            res.json(results);
        } catch (error: any) {
            console.error("Account Analysis failed:", error);
            res.status(500).json({ error: error.message });
        }
    }

    async getReconciliation(req: Request, res: Response) {
        try {
            // Use query params for simple GET
            const ledgerId = req.query.ledgerId as string;
            const periodName = req.query.periodName as string;

            if (!ledgerId || !periodName) throw new Error("Missing ledgerId or periodName");

            const results = await require("./sla.reporting.service").slaReportingService.getReconciliation({
                ledgerId, periodName
            });
            res.json(results);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Helper to fetch source data for Explainability
    async reconstructPayload(partial: any): Promise<any> {
        console.log(`[SLA] Reconstructing payload for ${partial.entityTable} / ${partial.entityId}`);
        // 1. AP Invoices
        if (partial.entityTable === "ap_invoices") {
            const { apInvoices } = require("../../../shared/schema");
            const [invoice] = await db.select().from(apInvoices).where(eq(apInvoices.id, partial.entityId));
            if (invoice) {
                return {
                    ...partial,
                    ledgerId: partial.ledgerId || invoice.ledgerId || "PRIMARY",
                    eventDate: partial.eventDate || new Date(),
                    glDate: partial.glDate || new Date(),
                    currencyCode: partial.currencyCode || invoice.currency,
                    amount: Number(invoice.amount),
                    sourceData: {
                        invoiceId: invoice.id,
                        invoiceNumber: invoice.invoiceNumber,
                        supplierId: invoice.supplierId,
                        amount: invoice.amount,
                        description: invoice.description
                    }
                };
            }
        }
        // 2. AR Invoices
        // Add other modules here...

        throw new Error(`Cannot reconstruct payload for ${partial.entityTable}: Entity not found or mapped.`);
    }
}

export const slaController = new SlaController();
