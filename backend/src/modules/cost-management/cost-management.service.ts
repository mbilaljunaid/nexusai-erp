import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CostBook } from './entities/cost-book.entity';
import { CostOrganization } from './entities/cost-organization.entity';
import { CostElement } from './entities/cost-element.entity';
import { CostProfile } from './entities/cost-profile.entity';
import { CstItemCost } from './entities/cst-item-cost.entity';
import { OnHandBalance } from '../inventory/entities/on-hand-balance.entity';

@Injectable()
export class CostManagementService {
    private readonly logger = new Logger(CostManagementService.name);

    constructor(
        @InjectRepository(CostBook) private costBookRepo: Repository<CostBook>,
        @InjectRepository(CostOrganization) private costOrgRepo: Repository<CostOrganization>,
        @InjectRepository(CostElement) private costElementRepo: Repository<CostElement>,
        @InjectRepository(CostProfile) private costProfileRepo: Repository<CostProfile>,
        @InjectRepository(CstItemCost) private itemCostRepo: Repository<CstItemCost>,
        @InjectRepository(OnHandBalance) private balanceRepo: Repository<OnHandBalance>
    ) { }

    async onModuleInit() {
        this.logger.log('Cost Management Module initialized');
    }

    async getWorkspaceValuation(orgId: string): Promise<number> {
        // SQL SUM query joining Balance and Cost.
        const result = await this.balanceRepo.createQueryBuilder('balance')
            .select('SUM(balance.quantity * cost.unitCost)', 'totalValue')
            .innerJoin(CstItemCost, 'cost', 'cost.item = balance.item AND cost.inventoryOrganization = balance.organization')
            .where('balance.organization = :orgId', { orgId })
            .getRawOne();

        return result ? Number(result.totalValue) : 0;
    }
}
