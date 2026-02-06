
import { Injectable, Logger, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../shared/schema';
import { eq, desc, and, gte, lte, or, isNull } from 'drizzle-orm';

@Injectable()
export class ProcurementApprovalService {
    private readonly logger = new Logger(ProcurementApprovalService.name);

    constructor(
        @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
    ) { }

    async evaluateRule(documentType: string, amount: number, category?: string): Promise<{ action: string, approverId?: string }> {
        // Find matching rule with highest priority
        // Logic: amount >= minAmount AND (maxAmount IS NULL OR amount <= maxAmount)
        // Drizzle doesn't support complex filtering in `findMany` easily without raw SQL or intricate helpers sometimes, but let's try.
        // Actually, fetching all rules for DocType and filtering in memory is safer for complex logic given low volume of rules.
        // OR construct query carefully.

        const rules = await this.db.query.approvalRules.findMany({
            where: eq(schema.approvalRules.documentType, documentType),
            orderBy: [desc(schema.approvalRules.priority)]
        });

        for (const rule of rules) {
            const min = Number(rule.minAmount) || 0;
            const max = rule.maxAmount ? Number(rule.maxAmount) : Infinity;

            if (amount >= min && amount <= max) {
                // Match found
                return { action: 'Approve', approverId: rule.approverId }; // Or 'Route'
            }
        }

        // Default fallback
        return { action: 'AutoApprove' };
    }

    async seedDefaultRules() {
        // Count implementation
        const countRes = await this.db.select({ count: schema.approvalRules.id }).from(schema.approvalRules).limit(1);

        if (countRes.length === 0) {
            await this.db.insert(schema.approvalRules).values([
                { ruleName: 'Auto Approve Small', documentType: 'Requisition', minAmount: '0', maxAmount: '500', approverId: 'AUTO', priority: 1, categoryFilter: 'ALL' },
                { ruleName: 'Manager Approval', documentType: 'Requisition', minAmount: '500.01', maxAmount: '5000', approverId: 'MANAGER-1', priority: 2, categoryFilter: 'ALL' },
                { ruleName: 'Director Approval', documentType: 'Requisition', minAmount: '5000.01', approverId: 'DIRECTOR-1', priority: 3, categoryFilter: 'ALL' },
            ]);
            this.logger.log('Seeded default approval rules');
        }
    }
}
