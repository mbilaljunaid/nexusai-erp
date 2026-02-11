import { Request, Response } from "express";
import { db } from "../../db"; // Relative from controller (depth 3->1 = 2 steps: modules/revenue -> modules -> server? No. modules/revenue -> modules -> server. ../../db)
import {
    revenueContracts, performanceObligations, revenueRecognitions,
    revenueSourceEvents, revenueSspBooks, revenueSspLines,
    revenuePeriods, revenueGlAccounts as revAcctSchema,
    revenueIdentificationRules, performanceObligationRules,
    revenueContractVersions,
    accounts, glLedgers, products
} from "@shared/schema";
import { eq, desc, and, sql, lte, gte } from "drizzle-orm";
import { revenueService } from "./services/RevenueService";
import { revenueForecastingService } from "./services/RevenueForecastingService";

export class RevenueController {

    // ==============================================================================
    // 1. CONFIGURATION
    // ==============================================================================

    async getAccountingConfig(req: Request, res: Response) {
        try {
            const config = await db.select().from(revAcctSchema);
            res.json(config);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch accounting setup" });
        }
    }

    async updateAccountingConfig(req: Request, res: Response) {
        try {
            const { ledgerId, ...data } = req.body;
            const existing = await db.select().from(revAcctSchema)
                .where(eq(revAcctSchema.ledgerId, ledgerId))
                .limit(1);

            if (existing.length > 0) {
                const [updated] = await db.update(revAcctSchema)
                    .set({ ...data, lastUpdated: new Date() })
                    .where(eq(revAcctSchema.ledgerId, ledgerId))
                    .returning();
                res.json(updated);
            } else {
                const [inserted] = await db.insert(revAcctSchema)
                    .values({ ledgerId, ...data })
                    .returning();
                res.json(inserted);
            }
        } catch (error) {
            res.status(500).json({ error: "Failed to save accounting setup" });
        }
    }

    // ==============================================================================
    // 2. CONTRACTS (Workbench)
    // ==============================================================================

    async getContracts(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = (page - 1) * limit;

            const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(revenueContracts);
            const contracts = await db.select({
                ...revenueContracts,
                customerName: accounts.name,
                ledgerName: glLedgers.name,
            })
                .from(revenueContracts)
                .leftJoin(accounts, eq(revenueContracts.customerId, accounts.id))
                .leftJoin(glLedgers, eq(revenueContracts.ledgerId, glLedgers.id))
                .orderBy(desc(revenueContracts.createdAt))
                .limit(limit)
                .offset(offset);

            res.json({
                data: contracts,
                meta: {
                    total: Number(count),
                    page,
                    limit,
                    totalPages: Math.ceil(Number(count) / limit)
                }
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getContractDetails(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const contract = await db.query.revenueContracts.findFirst({
                where: eq(revenueContracts.id, id),
            });

            if (!contract) return res.status(404).json({ error: "Contract not found" });

            const pobs = await db.select().from(performanceObligations).where(eq(performanceObligations.contractId, id));

            const schedules = await db.select().from(revenueRecognitions)
                .where(eq(revenueRecognitions.contractId, id))
                .orderBy(desc(revenueRecognitions.scheduleDate));

            res.json({ ...contract, performanceObligations: pobs, revenueRecognitions: schedules });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getContractHistory(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const history = await db.select().from(revenueContractVersions)
                .where(eq(revenueContractVersions.contractId, id))
                .orderBy(desc(revenueContractVersions.versionNumber));
            res.json(history);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async modifyContract(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { newTotalValue, reason } = req.body;
            if (!newTotalValue || isNaN(newTotalValue)) return res.status(400).json({ error: "Valid newTotalValue is required" });

            const result = await revenueService.processContractModification(id, {
                newTotalValue: parseFloat(newTotalValue),
                reason: reason || "Manual Modification"
            });
            res.json({ message: "Contract modification processed successfully", ...result });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ==============================================================================
    // 3. SOURCE EVENTS
    // ==============================================================================

    async getEvents(req: Request, res: Response) {
        try {
            const events = await db.select().from(revenueSourceEvents)
                .orderBy(desc(revenueSourceEvents.eventDate))
                .limit(100);
            res.json(events);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async ingestEvent(req: Request, res: Response) {
        try {
            if (!req.body.sourceId || !req.body.amount || !req.body.eventType) {
                return res.status(400).json({ error: "Missing required fields: sourceId, amount, eventType" });
            }
            const [event] = await db.insert(revenueSourceEvents).values({
                sourceSystem: req.body.sourceSystem || "API",
                sourceId: req.body.sourceId,
                eventType: req.body.eventType,
                itemId: req.body.itemId,
                customerId: req.body.customerId || "CUST-GENERIC",
                ledgerId: req.body.ledgerId || "PRIMARY",
                amount: req.body.amount.toString(),
                currency: req.body.currency || "USD",
                eventDate: req.body.eventDate ? new Date(req.body.eventDate) : new Date(),
                referenceNumber: req.body.referenceNumber,
                legalEntityId: req.body.legalEntityId || "CORE",
                orgId: req.body.orgId || "OU-01",
                processingStatus: "Pending"
            }).returning();
            res.status(201).json(event);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async processEventsJob(req: Request, res: Response) {
        try {
            const pendingEvents = await db.select().from(revenueSourceEvents)
                .where(eq(revenueSourceEvents.processingStatus, "Pending"))
                .orderBy(revenueSourceEvents.eventDate); // FIFO

            const results = [];
            for (const event of pendingEvents) {
                try {
                    const result = await revenueService.processSourceEvent({
                        sourceSystem: event.sourceSystem,
                        sourceId: event.sourceId,
                        eventType: event.eventType,
                        customerId: event.customerId || "UNKNOWN",
                        ledgerId: event.ledgerId || "PRIMARY",
                        amount: parseFloat(event.amount || "0"),
                        currency: event.currency || "USD",
                        eventDate: event.eventDate,
                        referenceNumber: event.referenceNumber,
                        legalEntityId: event.legalEntityId,
                        orgId: event.orgId
                    });
                    results.push({ id: event.id, status: "Success", ...result });
                } catch (procError: any) {
                    await db.update(revenueSourceEvents)
                        .set({ processingStatus: "Error", errorMessage: procError.message })
                        .where(eq(revenueSourceEvents.id, event.id));
                    results.push({ id: event.id, status: "Error", message: procError.message });
                }
            }
            res.json({ message: `Processed ${pendingEvents.length} events`, results });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ==============================================================================
    // 4. SSP / RULES
    // ==============================================================================

    async createSspBook(req: Request, res: Response) {
        try {
            const book = await revenueService.createSspBook({
                name: req.body.name,
                currency: req.body.currency,
                effectiveFrom: new Date(req.body.effectiveFrom)
            });
            res.json(book);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getSspBooks(req: Request, res: Response) {
        try {
            const books = await db.select().from(revenueSspBooks).orderBy(desc(revenueSspBooks.createdAt));
            res.json(books);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async addSspLine(req: Request, res: Response) {
        try {
            const line = await revenueService.addSspLine({
                bookId: req.body.bookId,
                itemId: req.body.itemId,
                sspValue: parseFloat(req.body.sspValue),
                minQuantity: req.body.minQuantity ? parseFloat(req.body.minQuantity) : undefined
            });
            res.json(line);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getSspLines(req: Request, res: Response) {
        try {
            const lines = await db.select({
                ...revenueSspLines,
                itemName: products.name
            })
                .from(revenueSspLines)
                .leftJoin(products, eq(revenueSspLines.itemId, products.id))
                .where(eq(revenueSspLines.bookId, req.params.id));
            res.json(lines);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateSspLine(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const [updated] = await db.update(revenueSspLines)
                .set({
                    itemId: req.body.itemId,
                    itemGroup: req.body.itemGroup,
                    sspValue: req.body.sspValue?.toString(),
                    minQuantity: req.body.minQuantity?.toString(),
                    maxQuantity: req.body.maxQuantity?.toString(),
                    region: req.body.region
                })
                .where(eq(revenueSspLines.id, id))
                .returning();
            res.json(updated);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteSspLine(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await db.delete(revenueSspLines).where(eq(revenueSspLines.id, id));
            res.json({ message: "SSP line deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getIdentificationRules(req: Request, res: Response) {
        try {
            const rules = await db.select().from(revenueIdentificationRules).orderBy(desc(revenueIdentificationRules.priority));
            res.json(rules);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createIdentificationRule(req: Request, res: Response) {
        try {
            const [rule] = await db.insert(revenueIdentificationRules).values({
                name: req.body.name,
                description: req.body.description,
                groupingCriteria: req.body.groupingCriteria,
                priority: parseInt(req.body.priority || "1"),
                status: "Active"
            }).returning();
            res.json(rule);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getPobRules(req: Request, res: Response) {
        try {
            const rules = await db.select().from(performanceObligationRules).orderBy(desc(performanceObligationRules.priority));
            res.json(rules);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async createPobRule(req: Request, res: Response) {
        try {
            const [rule] = await db.insert(performanceObligationRules).values({
                name: req.body.name,
                description: req.body.description,
                attributeName: req.body.attributeName,
                attributeValue: req.body.attributeValue,
                pobName: req.body.pobName,
                satisfactionMethod: req.body.satisfactionMethod || "Ratable",
                defaultDurationMonths: parseInt(req.body.defaultDurationMonths || "12"),
                priority: parseInt(req.body.priority || "1"),
                status: "Active"
            }).returning();
            res.json(rule);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // ==============================================================================
    // 5. REPORTING & PERIODS
    // ==============================================================================

    async getWaterfall(req: Request, res: Response) {
        try {
            const year = parseInt(req.query.year as string) || new Date().getFullYear();
            const waterfall = await revenueService.getRevenueWaterfall(year);
            res.json(waterfall);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getDeferredMatrix(req: Request, res: Response) {
        try {
            const dateStr = req.query.date as string;
            const asOfDate = dateStr ? new Date(dateStr) : new Date();
            const matrix = await revenueService.getDeferredRevenue(asOfDate);
            res.json(matrix);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getForecast(req: Request, res: Response) {
        try {
            const months = parseInt(req.query.months as string) || 6;
            const result = await revenueForecastingService.generateForecast(months);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getPeriods(req: Request, res: Response) {
        try {
            const periods = await db.select().from(revenuePeriods).orderBy(desc(revenuePeriods.startDate));
            res.json(periods);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async closePeriod(req: Request, res: Response) {
        try {
            const { periodId } = req.body;
            const period = await db.query.revenuePeriods.findFirst({
                where: eq(revenuePeriods.id, periodId)
            });
            if (!period) return res.status(404).json({ error: "Period not found" });

            // Pending checks
            const pendingEvents = await db.select().from(revenueSourceEvents)
                .where(and(
                    eq(revenueSourceEvents.processingStatus, "Pending"),
                    lte(revenueSourceEvents.eventDate, period.endDate),
                    gte(revenueSourceEvents.eventDate, period.startDate)
                ));
            if (pendingEvents.length > 0) {
                return res.status(400).json({ error: "Cannot close period. Unprocessed source events exist.", count: pendingEvents.length });
            }
            const pendingSchedules = await db.select().from(revenueRecognitions)
                .where(and(
                    eq(revenueRecognitions.status, "Pending"),
                    lte(revenueRecognitions.scheduleDate, period.endDate),
                    gte(revenueRecognitions.scheduleDate, period.startDate)
                ));

            if (pendingSchedules.length > 0) {
                return res.status(400).json({ error: "Cannot close period. Unposted recognition schedules exist.", count: pendingSchedules.length });
            }

            const [updated] = await db.update(revenuePeriods)
                .set({ status: "Closed", closedAt: new Date() })
                .where(eq(revenuePeriods.id, periodId))
                .returning();
            res.json(updated);

        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async sweepPeriod(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await revenueService.runPeriodCloseSweep(id);
            res.json({ message: "Period Close Sweep completed successfully", ...result });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAuditTrace(req: Request, res: Response) {
        try {
            const { sourceId } = req.params;
            const sourceEvent = await db.query.revenueSourceEvents.findFirst({ where: eq(revenueSourceEvents.sourceId, sourceId) });
            if (!sourceEvent) return res.status(404).json({ error: "Source Event not found" });

            let contract = null, pobs = [], recognitions = [];
            if (sourceEvent.contractId) {
                contract = await db.query.revenueContracts.findFirst({ where: eq(revenueContracts.id, sourceEvent.contractId) });
                if (contract) {
                    pobs = await db.select().from(performanceObligations).where(eq(performanceObligations.contractId, contract.id));
                    recognitions = await db.select().from(revenueRecognitions).where(eq(revenueRecognitions.contractId, contract.id));
                }
            }
            res.json({ sourceEvent, contract, pobs, recognitions });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

}

export const revenueController = new RevenueController();
