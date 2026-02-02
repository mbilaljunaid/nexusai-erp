
import { Router } from "express";
import { arAiService } from "../services/ar-ai";

const router = Router();

router.post("/predict-payment", async (req, res) => {
    try {
        const { invoiceIds } = req.body;
        if (!Array.isArray(invoiceIds)) return res.status(400).json({ message: "invoiceIds must be an array" });

        const predictions = await arAiService.predictPaymentDates(invoiceIds);
        res.json(predictions);
    } catch (error: any) {
        res.status(500).json({ message: "Prediction failed" });
    }
});

router.get("/collection-advice/:customerId", async (req, res) => {
    try {
        const advice = await arAiService.recommendCollectionStrategy(req.params.customerId);
        res.json(advice);
    } catch (error) {
        res.status(500).json({ message: "Failed to get advice" });
    }
});

export default router;
