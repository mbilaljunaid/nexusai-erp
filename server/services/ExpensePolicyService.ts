import { storage } from "../storage";
import { ExpenseLine, ExpensePolicy } from "@shared/schema";

export class ExpensePolicyService {
    /**
     * Validate an expense line against active policies and advanced heuristics.
     */
    async validateLine(tenantId: string, line: any): Promise<{
        isValid: boolean;
        violations: string[];
        confidenceScore: number;
    }> {
        const policies = (await storage.listExpensePolicies(tenantId))
            .filter(p => !p.category || p.category === line.category);

        const violations: string[] = [];
        let isFlagged = false;

        // 1. Threshold checks
        for (const policy of policies) {
            if (policy.limitAmount && Number(line.amount) > Number(policy.limitAmount)) {
                violations.push(`Amount exceeds limit for ${line.category}: $${policy.limitAmount}`);
                isFlagged = true;
            }
            if (policy.requiresReceiptAbove && Number(line.amount) > Number(policy.requiresReceiptAbove) && !line.receiptUrl) {
                violations.push(`Receipt required for amounts above $${policy.requiresReceiptAbove}`);
                isFlagged = true;
            }
        }

        // 2. Weekend/Holiday Heuristics [PHASE 7]
        const expenseDate = new Date(line.date || line.expenseDate);
        const day = expenseDate.getDay();
        const isWeekend = day === 0 || day === 6;

        if (isWeekend && line.category !== 'TRAVEL') {
            violations.push("Weekend spend detected in non-travel category (Anomaly)");
            isFlagged = true;
        }

        // 3. Split Transaction Detection [PHASE 7]
        const recentLines = await storage.listAllExpenseLines(tenantId);
        const splitMates = recentLines.filter(l =>
            l.merchant === line.merchant &&
            new Date(l.date).toDateString() === expenseDate.toDateString() &&
            l.id !== line.id
        );

        if (splitMates.length > 0) {
            violations.push("Potential split transaction detected (Duplicate merchant & date)");
            isFlagged = true;
        }

        return {
            isValid: !isFlagged,
            violations,
            confidenceScore: isFlagged ? 0.45 : 0.95
        };
    }

    /**
     * Detect potential duplicate expenses
     * Heuristic: Same merchant, same amount, same date
     */
    async detectDuplicates(tenantId: string, line: any): Promise<boolean> {
        const allLines = await storage.listAllExpenseLines(tenantId);

        const isDuplicate = allLines.some(existing =>
            existing.merchant === line.merchant &&
            Number(existing.amount) === Number(line.amount) &&
            new Date(existing.date).toDateString() === new Date(line.date || line.expenseDate).toDateString() &&
            existing.id !== (line.id || null)
        );

        return isDuplicate;
    }
}

export const expensePolicyService = new ExpensePolicyService();
