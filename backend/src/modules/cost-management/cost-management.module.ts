import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostBook } from './entities/cost-book.entity';
import { CostOrganization } from './entities/cost-organization.entity';
import { CostElement } from './entities/cost-element.entity';
import { CostProfile } from './entities/cost-profile.entity';
import { CmrReceiptDistribution } from './entities/cmr-receipt-distribution.entity';
import { CstCostDistribution } from './entities/cst-cost-distribution.entity';
import { CstItemCost } from './entities/cst-item-cost.entity';
import { OnHandBalance } from '../inventory/entities/on-hand-balance.entity';
import { CostManagementService } from './cost-management.service';
import { ReceiptAccountingService } from './receipt-accounting.service';
import { CostProcessorService } from './cost-processor.service';
import { CostManagementController } from './cost-management.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { SlaService } from './sla.service';
import { FinanceModule } from '../finance/finance.module';

import { CostPeriod } from './entities/cost-period.entity';
import { CostPeriodService } from './cost-period.service';
import { ReconciliationService } from './reconciliation.service';
import { MaterialTransaction } from '../inventory/entities/material-transaction.entity';
import { InventoryOrganization } from '../inventory/entities/inventory-organization.entity';
import { Item } from '../inventory/entities/item.entity';
import { CstStandardCost } from './entities/cst-standard-cost.entity';
import { CostScenario } from './entities/cost-scenario.entity';
import { LandedCostCharge } from './entities/landed-cost.entity';
import { GLEntry } from '../erp/entities/gl-entry.entity';
import { StandardCostService } from './standard-cost.service';
import { GlIntegrationService } from '../finance/gl-integration.service';
import { LcmService } from './lcm.service';
import { WorkOrder } from '../manufacturing/entities/work-order.entity';
import { WipTransaction } from './entities/wip-transaction.entity';
import { WipCostingService } from './wip-costing.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CostBook,
            CostPeriod, CmrReceiptDistribution, MaterialTransaction,
            CstItemCost, GLEntry, CostOrganization, InventoryOrganization, Item,
            CstStandardCost, CostScenario, LandedCostCharge,
            CstCostDistribution, OnHandBalance, CostBook, CostElement, CostProfile,
            WorkOrder, WipTransaction
        ]),
        forwardRef(() => InventoryModule),
        FinanceModule
    ],
    controllers: [CostManagementController],
    providers: [
        CostManagementService,
        CostPeriodService,
        ReceiptAccountingService,
        ReconciliationService,
        StandardCostService,
        GlIntegrationService,
        LcmService,
        WipCostingService,
        SlaService,
        CostProcessorService
    ],
    exports: [
        CostManagementService,
        ReceiptAccountingService,
        CostProcessorService,
        SlaService,
        CostPeriodService,
        ReconciliationService,
        StandardCostService,
        GlIntegrationService,
        LcmService,
        WipCostingService
    ],
})
export class CostManagementModule { }
