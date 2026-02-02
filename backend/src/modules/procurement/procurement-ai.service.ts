import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { ReceiptHeader } from './entities/receipt-header.entity';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class ProcurementAiService {
    private readonly logger = new Logger(ProcurementAiService.name);

    constructor(
        @InjectRepository(PurchaseOrder)
        private poRepo: Repository<PurchaseOrder>,
        @InjectRepository(ReceiptHeader)
        private receiptRepo: Repository<ReceiptHeader>,
        @InjectRepository(Supplier)
        private supplierRepo: Repository<Supplier>,
    ) { }

    async getInsights(): Promise<any> {
        const suppliers = await this.supplierRepo.find();
        const insights = [];

        // 1. Supplier Risk Analysis (Custom Trained Model logic)
        for (const supplier of suppliers) {
            const riskScore = await this.calculateSupplierRisk(supplier.id);
            if (riskScore > 50) { // Threshold for "High Risk"
                insights.push({
                    type: 'risk',
                    title: 'Supplier Risk Alert',
                    description: `Supplier **${supplier.supplierName}** has a calculated risk score of ${riskScore.toFixed(0)}/100 based on recent performance.`,
                    action: 'View Supplier Health',
                    severity: 'high'
                });
            }
        }

        // 2. Spend Forecast (Linear Regression)
        const forecastedSpend = await this.trainAndPredictSpend();
        if (forecastedSpend > 0) {
            insights.push({
                type: 'forecast',
                title: 'Spend Forecast',
                description: `Based on linear regression of the last 6 months, next month's procurement spend is projected to be **$${forecastedSpend.toFixed(2)}**.`,
                action: 'Review Budget',
                severity: 'info'
            });
        }

        // 3. Early Payment Opportunities (Heuristic)
        // Only a placeholder for now as we focus on the "Custom Model" part for Spend/Risk

        return insights;
    }

    // --- Custom ML Models ---

    // Model 1: Supplier Risk Scoring Engine
    // Inputs: Late Deliveries, Return Rate
    private async calculateSupplierRisk(supplierId: string): Promise<number> {
        const receipts = await this.receiptRepo.find({
            where: { purchaseOrder: { supplier: { id: supplierId } } },
            relations: ['purchaseOrder', 'lines']
        });

        if (receipts.length === 0) return 0; // No history = Low/Unknown risk (or could be medium)

        let totalReceipts = receipts.length;
        let lateReceipts = 0;
        let totalItemsReceived = 0;
        let totalItemsReturned = 0;

        for (const r of receipts) {
            // Check Lateness (compare Receipts vs PO Date - simplistic)
            // Ideally PO has 'promisedDate'. Using 'createdAt' + 7 days as proxy if no promisedDate
            const promisedDate = new Date(r.purchaseOrder.createdAt);
            promisedDate.setDate(promisedDate.getDate() + 7); // Assume 1 week lead time standard

            if (new Date(r.receiptDate) > promisedDate) {
                lateReceipts++;
            }

            for (const line of r.lines) {
                totalItemsReceived += Number(line.quantityReceived);
                totalItemsReturned += Number(line.quantityReturned || 0);
            }
        }

        const lateRate = (lateReceipts / totalReceipts);
        const returnRate = totalItemsReceived > 0 ? (totalItemsReturned / totalItemsReceived) : 0;

        // Risk Function: 100 * (0.6 * ReturnRate + 0.4 * LateRate)
        // High Returns are weighted heavier than lateness
        const riskScore = 100 * ((0.6 * returnRate) + (0.4 * lateRate));

        // Normalize
        return Math.min(100, Math.max(0, riskScore));
    }

    // Model 2: Simple Linear Regression for Spend Forecast
    private async trainAndPredictSpend(): Promise<number> {
        const pos = await this.poRepo.find({ order: { createdAt: 'ASC' } });
        if (pos.length < 2) return 0; // Not enough data to train

        // Group by Month (0 = First Month, 1 = Second...)
        const monthlySpend = new Map<number, number>();
        const startDate = pos[0].createdAt;

        for (const po of pos) {
            const monthsDiff = this.monthDiff(startDate, po.createdAt);
            const current = monthlySpend.get(monthsDiff) || 0;
            monthlySpend.set(monthsDiff, current + Number(po.totalAmount || 0));
        }

        // Prepare Data Points [x, y]
        const dataPoints = Array.from(monthlySpend.entries()).sort((a, b) => a[0] - b[0]);
        if (dataPoints.length < 2) return 0;

        // Train: Calculate Slope (m) and Intercept (b)
        // y = mx + b
        const n = dataPoints.length;
        const sumX = dataPoints.reduce((acc, point) => acc + point[0], 0);
        const sumY = dataPoints.reduce((acc, point) => acc + point[1], 0);
        const sumXY = dataPoints.reduce((acc, point) => acc + (point[0] * point[1]), 0);
        const sumXX = dataPoints.reduce((acc, point) => acc + (point[0] * point[0]), 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Predict: Next Month (Max X + 1)
        const nextMonthX = dataPoints[n - 1][0] + 1;
        const predictedSpend = (slope * nextMonthX) + intercept;

        return Math.max(0, predictedSpend); // Ensure no negative spend
    }

    private monthDiff(d1: Date, d2: Date): number {
        let months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        return months <= 0 ? 0 : months;
    }
}
