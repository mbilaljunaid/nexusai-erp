
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanUnit } from './entities/plan-unit.entity';

@Injectable()
export class FormulaService {
    private readonly logger = new Logger(FormulaService.name);

    constructor(
        @InjectRepository(PlanUnit)
        private planUnitRepository: Repository<PlanUnit>,
    ) { }

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
    async applyDriverRule(versionId: string, ruleExpression: string, targetFilter: Partial<PlanUnit>): Promise<number> {
        this.logger.log(`Applying Rule: "${ruleExpression}" to Version ${versionId}`);

        const units = await this.planUnitRepository.find({ where: { versionId, ...targetFilter } });
        let count = 0;

        for (const unit of units) {
            // Context for this row
            const context = {
                Amount: Number(unit.amount),
                // Future: Lookup other accounts (drivers) for this intersection
            };

            const newValue = this.evaluate(ruleExpression, context);

            if (!isNaN(newValue)) {
                unit.amount = newValue;
                unit.status = 'CALCULATED';
                await this.planUnitRepository.save(unit);
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

            const unit = this.planUnitRepository.create({
                versionId,
                scenarioId: 'TODO_lookup_Working', // Mock
                period,
                entityId,
                departmentId: deptId,
                accountId,
                amount: allocation,
                status: 'ALLOCATED',
                comment: `Allocated based on driver (Wt: ${weight}/${totalWeight})`
            });

            await this.planUnitRepository.save(unit);
            count++;
        }
        return count;
    }
}
