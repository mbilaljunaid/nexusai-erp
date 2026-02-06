
import { Injectable, Logger, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../shared/schema';
import { desc, sql } from 'drizzle-orm';

@Injectable()
export class ProcurementAiService {
    private readonly logger = new Logger(ProcurementAiService.name);

    constructor(
        @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
    ) { }

    async analyzeSpendPatterns(): Promise<any> {
        // Example logic: Aggregate spend by Supplier
        // Drizzle aggregation
        const spendBySupplier = await this.db.select({
            supplierId: schema.purchaseOrders.supplierId,
            totalSpend: sql<number>`sum(${schema.purchaseOrders.totalAmount})`
        })
            .from(schema.purchaseOrders)
            .groupBy(schema.purchaseOrders.supplierId)
            .orderBy(desc(sql`sum(${schema.purchaseOrders.totalAmount})`))
            .limit(5);

        return {
            topSuppliers: spendBySupplier,
            insight: 'Top 5 suppliers account for X% of spend.'
        };
    }

    async predictDeliveryDelays(): Promise<any> {
        // Example logic: Check late receipts
        // Simplification for migration
        const lateReceipts = await this.db.query.rcvShipmentHeaders.findMany({
            where: sql`${schema.rcvShipmentHeaders.receiptDate} > ${schema.rcvShipmentHeaders.expectedReceiptDate}`,
            limit: 10
        });

        return {
            atRisk: lateReceipts.length,
            ids: lateReceipts.map(r => r.id)
        };
    }
}
