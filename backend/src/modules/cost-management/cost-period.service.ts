import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { CostPeriod } from './entities/cost-period.entity';
import { CostOrganization } from './entities/cost-organization.entity';

@Injectable()
export class CostPeriodService {
    private readonly logger = new Logger(CostPeriodService.name);

    constructor(
        @InjectRepository(CostPeriod)
        private periodRepo: Repository<CostPeriod>,
        @InjectRepository(CostOrganization)
        private costOrgRepo: Repository<CostOrganization>
    ) { }

    private async resolveCostOrg(inventoryOrgId: string): Promise<CostOrganization> {
        // Use QueryBuilder or cast to avoid TS error if TypeORM types are strict
        const costOrg = await this.costOrgRepo.findOne({
            where: { inventoryOrganizationId: inventoryOrgId }
        });
        if (!costOrg) {
            // For MVP/Demo, if no Cost Org exists, maybe we assume 1:1 and auto-create or error?
            // Error is safer.
            throw new BadRequestException(`No Cost Organization defined for Inventory Org ${inventoryOrgId}`);
        }
        return costOrg;
    }

    async validateTransactionDate(inventoryOrgId: string, transactionDate: Date): Promise<void> {
        const costOrg = await this.resolveCostOrg(inventoryOrgId);

        const period = await this.periodRepo.findOne({
            where: {
                costOrganization: { id: costOrg.id },
                startDate: LessThanOrEqual(transactionDate),
                endDate: MoreThanOrEqual(transactionDate)
            }
        });

        if (!period) {
            throw new BadRequestException(`No Cost Period defined for date ${transactionDate.toISOString()} (Org: ${costOrg.code})`);
        }

        if (period.status !== 'Open') {
            throw new BadRequestException(`Cost Period '${period.periodName}' is ${period.status}. Transactions cannot be processed.`);
        }
    }

    async openPeriod(inventoryOrgId: string, periodName: string): Promise<CostPeriod> {
        const costOrg = await this.resolveCostOrg(inventoryOrgId);
        const period = await this.periodRepo.findOne({
            where: { costOrganization: { id: costOrg.id }, periodName }
        });
        if (!period) throw new BadRequestException('Period not found');

        period.status = 'Open';
        return this.periodRepo.save(period);
    }

    async closePeriod(inventoryOrgId: string, periodName: string): Promise<CostPeriod> {
        const costOrg = await this.resolveCostOrg(inventoryOrgId);
        const period = await this.periodRepo.findOne({
            where: { costOrganization: { id: costOrg.id }, periodName }
        });
        if (!period) throw new BadRequestException('Period not found');

        period.status = 'Closed';
        return this.periodRepo.save(period);
    }

    async createPeriod(costOrgId: string, name: string, start: Date, end: Date): Promise<CostPeriod> {
        // Here we might accept costOrgId directly if internal, OR inventoryOrgId.
        // Let's assume this is internal or admin method using CostOrgId for precision, 
        // OR we can genericize it. Let's keep it simple: assume the caller knows strictly if they are setting up Cost Structure.
        // But to be consistent with others, let's accept InventoryOrgId IF we want easy API usage.
        // Actually, let's support passed ID being treated as CostOrgId for setup.

        const period = this.periodRepo.create({
            costOrganization: { id: costOrgId } as any,
            periodName: name,
            startDate: start,
            endDate: end,
            status: 'Future Entry'
        });
        return this.periodRepo.save(period);
    }
}
