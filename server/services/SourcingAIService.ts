
import { db } from "../db";
import { sourcingRfqs, sourcingBids, sourcingBidLines } from "../../shared/schema/scm";
import { eq, and } from "drizzle-orm";

interface BidAnalysis {
    rfqId: string;
    totalBids: number;
    lowestBid: number;
    highestBid: number;
    averageBid: number;
    riskAnalysis: {
        bidId: string;
        supplierId: string;
        riskScore: number; // 0-100
        flags: string[]; // "Price Outlier", "Delivery Risk"
    }[];
    lineAnalysis: {
        lineId: string;
        meanPrice: number;
        stdDev: number;
        outliers: string[]; // List of Bid IDs
    }[];
}

export class SourcingAIService {

    async analyzeRFQ(rfqId: string): Promise<BidAnalysis> {
        // 1. Fetch Data using explicit joins to avoid generic 'db.query' issues if relations aren't perfect
        const rfq = await db.select().from(sourcingRfqs).where(eq(sourcingRfqs.id, rfqId)).limit(1);

        if (rfq.length === 0) throw new Error("RFQ not found");

        const bids = await db.select().from(sourcingBids)
            .where(and(eq(sourcingBids.rfqId, rfqId), eq(sourcingBids.bidStatus, "SUBMITTED")));

        if (bids.length === 0) {
            return {
                rfqId,
                totalBids: 0,
                lowestBid: 0,
                highestBid: 0,
                averageBid: 0,
                riskAnalysis: [],
                lineAnalysis: []
            };
        }

        // Fetch all lines for these bids
        const allBidLines = [];
        for (const bid of bids) {
            const lines = await db.select().from(sourcingBidLines).where(eq(sourcingBidLines.bidId, bid.id));
            allBidLines.push({ bidId: bid.id, supplierId: bid.supplierId, lines });
        }

        // 2. Perform Line-Level Statistical Analysis
        // Group prices by RFQ Line ID
        const linePrices: Record<string, { bidId: string; price: number }[]> = {};

        allBidLines.forEach(bid => {
            bid.lines.forEach((line) => {
                const lineId = line.rfqLineId;
                if (!linePrices[lineId]) linePrices[lineId] = [];
                linePrices[lineId].push({ bidId: bid.bidId, price: Number(line.offeredPrice) });
            });
        });

        const lineAnalysis = Object.keys(linePrices).map(lineId => {
            const prices = linePrices[lineId].map(p => p.price);
            const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
            const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
            const stdDev = Math.sqrt(variance);

            // Identify Outliers (> 1.5 Std Dev)
            const outliers = linePrices[lineId]
                .filter(p => Math.abs(p.price - mean) > (1.5 * stdDev))
                .map(p => p.bidId);

            return {
                lineId,
                meanPrice: mean,
                stdDev,
                outliers
            };
        });

        // 3. Bid-Level Risk Scoring
        const riskAnalysis = allBidLines.map(bid => {
            let riskScore = 0;
            const flags: string[] = [];
            let totalPrice = 0;

            // Check for Price Outliers
            const isPriceOutlier = lineAnalysis.some(l => l.outliers.includes(bid.bidId));
            if (isPriceOutlier) {
                riskScore += 40;
                flags.push("Price Outlier Detected");
            }

            // Check for Delivery Risk (Mock Logic: If lead time < 5 days, suspicious)
            const hasShortLeadTime = bid.lines.some((l) => l.supplierLeadTime && l.supplierLeadTime < 5);
            if (hasShortLeadTime) {
                riskScore += 20;
                flags.push("Unusually Short Lead Time");
            }

            bid.lines.forEach((l) => totalPrice += (Number(l.offeredPrice) * Number(l.offeredQuantity)));

            return {
                bidId: bid.bidId,
                supplierId: bid.supplierId,
                riskScore,
                flags,
                totalPrice
            };
        });

        // 4. Calculate Aggregate Stats
        const totalPrices = riskAnalysis.map(r => r.totalPrice);
        const lowestBid = Math.min(...totalPrices);
        const highestBid = Math.max(...totalPrices);
        const averageBid = totalPrices.reduce((a, b) => a + b, 0) / totalPrices.length || 0;

        return {
            rfqId,
            totalBids: bids.length,
            lowestBid,
            highestBid,
            averageBid,
            riskAnalysis: riskAnalysis.map(({ bidId, supplierId, riskScore, flags }) => ({ bidId, supplierId, riskScore, flags })),
            lineAnalysis
        };
    }
}

export const sourcingAIService = new SourcingAIService();
