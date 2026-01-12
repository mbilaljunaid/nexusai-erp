import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ApprovalRule } from './entities/approval-rule.entity';

@Injectable()
export class ApprovalService {
    private readonly logger = new Logger(ApprovalService.name);

    constructor(
        @InjectRepository(ApprovalRule)
        private ruleRepo: Repository<ApprovalRule>,
    ) { }

    async evaluateRule(documentType: string, amount: number, category?: string): Promise<string | null> {
        // Find matching rule with highest priority
        // For MVP, simple amount check
        const rules = await this.ruleRepo.find({
            where: { documentType },
            order: { priority: 'DESC' }
        });

        for (const rule of rules) {
            if (amount >= Number(rule.minAmount)) {
                if (!rule.maxAmount || amount <= Number(rule.maxAmount)) {
                    // If category filter exists, check it (logic omitted for MVP simplicity unless passed)
                    return rule.approverId;
                }
            }
        }

        // Default fallback (e.g., auto-approve if no rule matches, or specific admin)
        return null; // Null implies Auto-Approve for now, or 'ADMIN'
    }

    async seedDefaultRules() {
        const count = await this.ruleRepo.count();
        if (count === 0) {
            await this.ruleRepo.save([
                { ruleName: 'Auto Approve Small', documentType: 'Requisition', minAmount: 0, maxAmount: 500, approverId: 'AUTO', priority: 1, categoryFilter: 'ALL' },
                { ruleName: 'Manager Approval', documentType: 'Requisition', minAmount: 500.01, maxAmount: 5000, approverId: 'MANAGER-1', priority: 2, categoryFilter: 'ALL' },
                { ruleName: 'Director Approval', documentType: 'Requisition', minAmount: 5000.01, approverId: 'DIRECTOR-1', priority: 3, categoryFilter: 'ALL' },
            ] as any);
            this.logger.log('Seeded default approval rules');
        }
    }
}
