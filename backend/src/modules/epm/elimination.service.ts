
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanUnit } from './entities/plan-unit.entity';

@Injectable()
export class EliminationService {
    private readonly logger = new Logger(EliminationService.name);

    constructor(
        @InjectRepository(PlanUnit)
        private planUnitRepository: Repository<PlanUnit>,
    ) { }

    async runEliminations(versionId: string, scenarioId: string): Promise<number> {
        this.logger.log(`Running IC Eliminations for Version ${versionId}...`);

        // Simplified Logic: Find pair of IC Revenue and Expense
        // In a real system, we'd query rows where 'ICP' dimension is not null.
        // For this MVP, let's assume specific Accounts are flagged as IC.

        // Mock: Find 'IC_SALES' and create offset.
        // real implementation would group by Payee/Payer.

        const icSales = await this.planUnitRepository.find({
            where: {
                versionId,
                accountId: 'IC_SALES' // Placeholder
            }
        });

        let count = 0;
        for (const sale of icSales) {
            // Create Offset
            const elimination = this.planUnitRepository.create({
                scenarioId,
                versionId,
                period: sale.period,
                entityId: 'ELIM_ENTITY', // Group Elimination Node
                departmentId: 'NO_DEPT',
                accountId: 'IC_OFFSET',
                amount: Number(sale.amount) * -1, // Reverse the amount
                status: 'ELIMINATED'
            });
            await this.planUnitRepository.save(elimination);
            count++;
        }

        return count;
    }
}
