import { db } from "@db";
import { revenueContracts, performanceObligations, revenueRecognitions, revenueSourceEvents, revenueSspBooks, revenueSspLines } from "@db/schema/revenue";
import { eq, desc, and } from "drizzle-orm";
import { revenueService } from "../../services/RevenueService";

export function registerRevenueRoutes(app: Express) {

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
            const lines = await db.select().from(revenueSspLines).where(eq(revenueSspLines.bookId, req.params.id));
            res.json(lines);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch lines" });
        }
    });
}
