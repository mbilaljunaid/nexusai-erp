import { db } from "@db";
import {
    revenueContracts, performanceObligations, revenueRecognitions,
    revenueSourceEvents, revenueContractVersions, revenueSspBooks, revenueSspLines,
    revenuePeriods, revenueGlAccounts as revAcctSchema,
    products, accounts, glLedgers,
    revenueIdentificationRules, performanceObligationRules
} from "@shared/schema";
import { eq, desc, and, lte, gte, sql } from "drizzle-orm";
import { revenueService } from "../../services/RevenueService";
import type { Express, Request, Response } from "express";

export function registerRevenueRoutes(app: Express) {

    // ... existing routes ...

    // Accounting Setup
    app.get("/api/revenue/config/accounting", async (req: Request, res: Response) => {
        try {
            const config = await db.select().from(revAcctSchema);
            res.json(config);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch accounting setup" });
        }
    });

    app.post("/api/revenue/config/accounting", async (req: Request, res: Response) => {
        try {
            const { ledgerId, ...data } = req.body;

            // Upsert logic
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
            console.error("Setup Error:", error);
            res.status(500).json({ error: "Failed to save accounting setup" });
        }
    });

    // 1. Get All Contracts (Workbench List)
    app.get("/api/revenue/contracts", async (req: Request, res: Response) => {
        try {
            // Import schemas dynamically if not at top-level to assure no circular deps, 
            // or just use what we have.
            // We need to join with accounts (Customer) and glLedgers.
            // Note: Imports must be added to top of file.

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = (page - 1) * limit;

            // Get total count
            const [{ count }] = await db.select({ count: sql<number>`count(*)` })
                .from(revenueContracts);

            // Get paginated data
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
        } catch (error) {
            console.error("Error fetching revenue contracts:", error);
            res.status(500).json({ error: "Failed to fetch contracts" });
        }
    });

    // 2. Get Single Contract Details
    app.get("/api/revenue/contracts/:id", async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const contract = await db.query.revenueContracts.findFirst({
                where: eq(revenueContracts.id, id),
            });

            if (!contract) {
                return res.status(404).json({ error: "Contract not found" });
            }

            // Fetch POBs
            const pobs = await db.select().from(performanceObligations)
                .where(eq(performanceObligations.contractId, id));

            // Fetch Schedules (Recognitions)
            const schedules = await db.select().from(revenueRecognitions)
                .where(eq(revenueRecognitions.contractId, id))
                .orderBy(desc(revenueRecognitions.scheduleDate));

            res.json({
                ...contract,
                performanceObligations: pobs,
                revenueRecognitions: schedules
            });
        } catch (error) {
            console.error("Error fetching contract details:", error);
            res.status(500).json({ error: "Failed to fetch contract details" });
        }
    });

    // 3. Get Contract History
    app.get("/api/revenue/contracts/:id/history", async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const history = await db.select()
                .from(revenueContractVersions)
                .where(eq(revenueContractVersions.contractId, id))
                .orderBy(desc(revenueContractVersions.versionNumber));

            res.json(history);
        } catch (error) {
            console.error("Error fetching contract history:", error);
            res.status(500).json({ error: "Failed to fetch contract history" });
        }
    });

    // Record Contract Modification (ASC 606)
    app.post("/api/revenue/contracts/:id/modify", async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { newTotalValue, reason } = req.body;

            if (!newTotalValue || isNaN(newTotalValue)) {
                return res.status(400).json({ error: "Valid newTotalValue is required" });
            }

            const result = await revenueService.processContractModification(id, {
                newTotalValue: parseFloat(newTotalValue),
                reason: reason || "Manual Modification"
            });

            res.json({
                message: "Contract modification processed successfully",
                ...result
            });
        } catch (error: any) {
            console.error("Modification Error:", error);
            res.status(500).json({ error: error.message || "Failed to modify contract" });
        }
    });

    // 3. Get Source Events (Audit trail)
    app.get("/api/revenue/events", async (req: Request, res: Response) => {
        try {
            const events = await db.select().from(revenueSourceEvents)
                .orderBy(desc(revenueSourceEvents.eventDate))
                .limit(100);
            res.json(events);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch events" });
        }
    });

    // Ingest new source event
    app.post("/api/revenue/events", async (req: Request, res: Response) => {
        try {
            // Basic validation
            if (!req.body.sourceId || !req.body.amount || !req.body.eventType) {
                return res.status(400).json({ error: "Missing required fields: sourceId, amount, eventType" });
            }

            // In a real scenario, this would likely go into a queue (BullMQ/RabbitMQ).
            // Here we just insert into the table as "Pending".
            const [event] = await db.insert(revenueSourceEvents).values({
                sourceSystem: req.body.sourceSystem || "API",
                sourceId: req.body.sourceId,
                eventType: req.body.eventType,
                itemId: req.body.itemId, // Optional
                customerId: req.body.customerId || "CUST-GENERIC", // Default if missing
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
        } catch (error) {
            console.error("Ingestion Error:", error);
            res.status(500).json({ error: "Failed to ingest event" });
        }
    });

    // Trigger Event Processing Job
    app.post("/api/revenue/jobs/process-events", async (req: Request, res: Response) => {
        try {
            // 1. Fetch all Pending events
            const pendingEvents = await db.select().from(revenueSourceEvents)
                .where(eq(revenueSourceEvents.processingStatus, "Pending"))
                .orderBy(revenueSourceEvents.eventDate); // FIFO

            const results = [];

            // 2. Process individually (could be batched in real world)
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

                    // Update status is handled inside processSourceEvent service method
                    results.push({ id: event.id, status: "Success", ...result });

                } catch (procError: any) {
                    console.error(`Error processing event ${event.id}:`, procError);
                    // Update to Error status
                    await db.update(revenueSourceEvents)
                        .set({
                            processingStatus: "Error",
                            errorMessage: procError.message
                        })
                        .where(eq(revenueSourceEvents.id, event.id));

                    results.push({ id: event.id, status: "Error", message: procError.message });
                }
            }

            res.json({
                message: `Processed ${pendingEvents.length} events`,
                results
            });

        } catch (error) {
            console.error("Job Error:", error);
            res.status(500).json({ error: "Failed to run processing job" });
        }
    });

    // 4. SSP Manager Routes
    app.post("/api/revenue/ssp/books", async (req: Request, res: Response) => {
        try {
            const book = await revenueService.createSspBook({
                name: req.body.name,
                currency: req.body.currency,
                effectiveFrom: new Date(req.body.effectiveFrom)
            });
            res.json(book);
        } catch (error) {
            res.status(500).json({ error: "Failed to create SSP book" });
        }
    });

    app.get("/api/revenue/ssp/books", async (req: Request, res: Response) => {
        try {
            const books = await db.select().from(revenueSspBooks).orderBy(desc(revenueSspBooks.createdAt));
            res.json(books);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch SSP books" });
        }
    });

    app.post("/api/revenue/ssp/lines", async (req: Request, res: Response) => {
        try {
            const line = await revenueService.addSspLine({
                bookId: req.body.bookId,
                itemId: req.body.itemId,
                sspValue: parseFloat(req.body.sspValue),
                minQuantity: req.body.minQuantity ? parseFloat(req.body.minQuantity) : undefined
            });
            res.json(line);
        } catch (error) {
            res.status(500).json({ error: "Failed to add SSP line" });
        }
    });

    app.get("/api/revenue/ssp/books/:id/lines", async (req: Request, res: Response) => {
        try {
            const lines = await db.select({
                ...revenueSspLines,
                itemName: products.name
            })
                .from(revenueSspLines)
                .leftJoin(products, eq(revenueSspLines.itemId, products.id))
                .where(eq(revenueSspLines.bookId, req.params.id));

            res.json(lines);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch lines" });
        }
    });

    // 5. Reporting Routes
    app.get("/api/revenue/reporting/waterfall", async (req: Request, res: Response) => {
        try {
            const year = parseInt(req.query.year as string) || new Date().getFullYear();
            const waterfall = await revenueService.getRevenueWaterfall(year);
            res.json(waterfall);
        } catch (error) {
            console.error("Waterfall Error:", error);
            res.status(500).json({ error: "Failed to generate waterfall" });
        }
    });

    app.get("/api/revenue/reporting/deferred", async (req: Request, res: Response) => {
        try {
            // Default to today if not provided
            const dateStr = req.query.date as string;
            const asOfDate = dateStr ? new Date(dateStr) : new Date();

            const matrix = await revenueService.getDeferredRevenue(asOfDate);
            res.json(matrix);
        } catch (error) {
            console.error("Deferred Revenue Error:", error);
            res.status(500).json({ error: "Failed to generate deferred revenue matrix" });
        }
    });

    // 6. Period Management
    app.get("/api/revenue/periods", async (req: Request, res: Response) => {
        try {
            const periods = await db.select().from(revenuePeriods)
                .orderBy(desc(revenuePeriods.startDate));
            res.json(periods);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch revenue periods" });
        }
    });

    app.post("/api/revenue/periods/close", async (req: Request, res: Response) => {
        try {
            const { periodId } = req.body;

            // 1. Fetch period
            const period = await db.query.revenuePeriods.findFirst({
                where: eq(revenuePeriods.id, periodId)
            });

            if (!period) return res.status(404).json({ error: "Period not found" });

            // 2. Perform Validation (Simplified for MVP)
            // Check for Pending events in this range
            const pendingEvents = await db.select().from(revenueSourceEvents)
                .where(and(
                    eq(revenueSourceEvents.processingStatus, "Pending"),
                    lte(revenueSourceEvents.eventDate, period.endDate),
                    gte(revenueSourceEvents.eventDate, period.startDate)
                ));

            if (pendingEvents.length > 0) {
                return res.status(400).json({
                    error: "Cannot close period. Unprocessed source events exist.",
                    count: pendingEvents.length
                });
            }

            // Check for Pending Recognition Schedules
            const pendingSchedules = await db.select().from(revenueRecognitions)
                .where(and(
                    eq(revenueRecognitions.status, "Pending"),
                    lte(revenueRecognitions.scheduleDate, period.endDate),
                    gte(revenueRecognitions.scheduleDate, period.startDate)
                ));

            if (pendingSchedules.length > 0) {
                return res.status(400).json({
                    error: "Cannot close period. Unposted recognition schedules exist.",
                    count: pendingSchedules.length
                });
            }

            // 3. Close the period
            const [updated] = await db.update(revenuePeriods)
                .set({ status: "Closed", closedAt: new Date() })
                .where(eq(revenuePeriods.id, periodId))
                .returning();

            res.json(updated);
        } catch (error: any) {
            console.error("Period Close Error:", error);
            res.status(500).json({ error: error.message || "Failed to close period" });
        }
    });

    app.post("/api/revenue/periods/:id/sweep", async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await revenueService.runPeriodCloseSweep(id);
            res.json({
                message: "Period Close Sweep completed successfully",
                ...result
            });
        } catch (error: any) {
            console.error("Sweep Error:", error);
            res.status(500).json({ error: error.message || "Failed to run period sweep" });
        }
    });

    // 7. Rule Manager Routes
    // Identification Rules
    app.get("/api/revenue/rules/identification", async (req: Request, res: Response) => {
        try {
            const rules = await db.select().from(revenueIdentificationRules)
                .orderBy(desc(revenueIdentificationRules.priority));
            res.json(rules);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch identification rules" });
        }
    });

    app.post("/api/revenue/rules/identification", async (req: Request, res: Response) => {
        try {
            const [rule] = await db.insert(revenueIdentificationRules).values({
                name: req.body.name,
                description: req.body.description,
                groupingCriteria: req.body.groupingCriteria, // Array of strings
                priority: parseInt(req.body.priority || "1"),
                status: "Active"
            }).returning();
            res.json(rule);
        } catch (error) {
            res.status(500).json({ error: "Failed to create identification rule" });
        }
    });

    // POB Rules
    app.get("/api/revenue/rules/pob", async (req: Request, res: Response) => {
        try {
            const rules = await db.select().from(performanceObligationRules)
                .orderBy(desc(performanceObligationRules.priority));
            res.json(rules);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch POB rules" });
        }
    });

    app.post("/api/revenue/rules/pob", async (req: Request, res: Response) => {
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
        } catch (error) {
            res.status(500).json({ error: "Failed to create POB rule" });
        }
    });

    // 8. Audit Center Routes
    app.get("/api/revenue/audit/trace/:sourceId", async (req: Request, res: Response) => {
        try {
            const { sourceId } = req.params;

            // 1. Find Source Event
            const sourceEvent = await db.query.revenueSourceEvents.findFirst({
                where: eq(revenueSourceEvents.sourceId, sourceId)
            });

            if (!sourceEvent) {
                return res.status(404).json({ error: "Source Event not found" });
            }

            // 2. Find Contract
            let contract = null;
            let pobs = [];
            let recognitions = [];

            if (sourceEvent.contractId) {
                contract = await db.query.revenueContracts.findFirst({
                    where: eq(revenueContracts.id, sourceEvent.contractId)
                });

                if (contract) {
                    pobs = await db.select().from(performanceObligations).where(eq(performanceObligations.contractId, contract.id));
                    recognitions = await db.select().from(revenueRecognitions).where(eq(revenueRecognitions.contractId, contract.id));
                }
            }

            // 3. Assemble Trace
            res.json({
                sourceEvent,
                contract,
                pobs,
                recognitions,
                // In future: GL Journals
            });
        } catch (error) {
            console.error("Audit Trace Error:", error);
            res.status(500).json({ error: "Failed to build audit trace" });
        }
    });

    // 9. Forecasting
    app.get("/api/revenue/forecasting/projection", async (req: Request, res: Response) => {
        try {
            const months = parseInt(req.query.months as string) || 6;
            // Lazy load service to avoid circular deps if needed, or import at top
            const { revenueForecastingService } = await import("../../services/RevenueForecastingService");
            const result = await revenueForecastingService.generateForecast(months);
            res.json(result);
        } catch (error) {
            console.error("Forecasting Error:", error);
            res.status(500).json({ error: "Failed to generate forecast" });
        }
    });
}
