
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider.ts';
import * as schema from '../../../../shared/schema/index.ts';

@Injectable()
export class FormulaService {
    private readonly logger = new Logger(FormulaService.name);

    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    /**
     * Safe Expression Evaluator (MVP)
     * Replaces simple tokens like @Amount, @Price with values.
     * Uses 'Function' constructor for sandboxed evaluation (Caution: Security risk if user input not sanitized).
     * For Enterprise production, use a parser like `mathjs`.
     */
    evaluate(expression: string, context: Record<string, number>): number {
        // 1. Replace variables in expression
        let parsed = expression;
        for (const [key, val] of Object.entries(context)) {
            parsed = parsed.replace(new RegExp(`\\b${key}\\b`, 'g'), String(val));
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-implied-eval
            return new Function(`return ${parsed}`)();
        } catch (e) {
            this.logger.error(`Formula Error: ${expression} -> ${parsed}`, e);
            return 0;
        }
    }

    /**
     * Applies a driver-based formula to a set of PlanUnits.
     * Example: "Revenue = Price * Volume" (where Price and Volume are other PlanUnits or Constants)
     * MVP Example: "Adjusted = Amount * 1.05"
     */
    async applyDriverRule(versionId: string, ruleExpression: string, targetFilter: Partial<typeof schema.planUnits.$inferSelect>): Promise<number> {
        this.logger.log(`Applying Rule: "${ruleExpression}" to Version ${versionId}`);

        // Construct where clause dynamically
        const whereConditions = [eq(schema.planUnits.versionId, versionId)];
        if (targetFilter.scenarioId) whereConditions.push(eq(schema.planUnits.scenarioId, targetFilter.scenarioId));
        if (targetFilter.entityId) whereConditions.push(eq(schema.planUnits.entityId, targetFilter.entityId));
        if (targetFilter.departmentId) whereConditions.push(eq(schema.planUnits.departmentId, targetFilter.departmentId));
        if (targetFilter.accountId) whereConditions.push(eq(schema.planUnits.accountId, targetFilter.accountId));

        const units = await this.db.query.planUnits.findMany({
            where: and(...whereConditions)
        });

        let count = 0;

        for (const unit of units) {
            // Context for this row
            const context = {
                Amount: Number(unit.amount),
                // Future: Lookup other accounts (drivers) for this intersection
            };

            const newValue = this.evaluate(ruleExpression, context);

            if (!isNaN(newValue)) {
                await this.db.update(schema.planUnits)
                    .set({
                        amount: String(newValue),
                        status: 'CALCULATED'
                    })
                    .where(eq(schema.planUnits.id, unit.id));
                count++;
            }
        }

        return count;
    }

    /**
     * Allocates a pool amount to children entities based on a driver weight.
     * @param poolAmount Total amount to spread
     * @param driverMap Map of DeptId -> Weight (e.g. Headcount)
     * @param versionId Target Version
     * @param accountId Target Account
     */
    async allocate(poolAmount: number, driverMap: Record<string, number>, versionId: string, accountId: string, period: string, entityId: string): Promise<number> {
        // 1. Calculate Total Weight
        const totalWeight = Object.values(driverMap).reduce((a, b) => a + b, 0);
        if (totalWeight === 0) return 0;

        let count = 0;
        for (const [deptId, weight] of Object.entries(driverMap)) {
            const allocation = poolAmount * (weight / totalWeight);

            await this.db.insert(schema.planUnits).values({
                versionId,
                scenarioId: 'TODO_lookup_Working', // Mock
                period,
                entityId,
                departmentId: deptId,
                accountId,
                amount: String(allocation),
                status: 'ALLOCATED',
                // comment: `Allocated based on driver (Wt: ${weight}/${totalWeight})` // Commenting out as schema might miss it
            });

            count++;
        }
        return count;
    }
}
