import { db } from "@db";
import {
    revenueContracts, performanceObligations, revenueRecognitions,
    revenueSourceEvents, revenueSspBooks, revenueSspLines,
    revenuePeriods
} from "@db/schema/revenue";
import { revenueGlAccounts as revAcctSchema } from "@db/schema/revenue_accounting";
import { products } from "@shared/schema/crm";
import { eq, desc, and, lte, gte } from "drizzle-orm";
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
            // In real world, pagination is mandatory for >1M contracts.
            // Implementing basic limit for now.
            const contracts = await db.select().from(revenueContracts)
                .orderBy(desc(revenueContracts.createdAt))
                .limit(50);

            res.json(contracts);
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
}
