import { Router } from "express";
import { PriceBookService } from "./PriceBookService";

const router = Router();

// GET /api/crm/price-books
// List all active price books
router.get("/price-books", async (req, res) => {
    try {
        const priceBooks = await PriceBookService.getActivePriceBooks();
        res.json(priceBooks);
    } catch (error) {
        console.error("Error fetching price books:", error);
        res.status(500).json({ error: "Failed to fetch price books" });
    }
});

// GET /api/crm/price-books/:id/entries
// Get entries for a specific book (supports searching by product name)
router.get("/price-books/:id/entries", async (req, res) => {
    try {
        const { id } = req.params;
        const { search } = req.query;
        const entries = await PriceBookService.getPriceBookEntries(id, search as string);
        res.json(entries);
    } catch (error) {
        console.error("Error fetching price book entries:", error);
        res.status(500).json({ error: "Failed to fetch price book entries" });
    }
});

export default router;
