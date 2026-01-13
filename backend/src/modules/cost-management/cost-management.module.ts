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

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CostBook,
            CostOrganization,
            CostElement,
            CostProfile,
            CmrReceiptDistribution,
            CstCostDistribution,
            CstItemCost,
            OnHandBalance
        ]),
        forwardRef(() => InventoryModule),
        FinanceModule
    ],
    controllers: [CostManagementController],
    providers: [CostManagementService, ReceiptAccountingService, CostProcessorService, SlaService],
    exports: [CostManagementService, ReceiptAccountingService, CostProcessorService, SlaService],
})
export class CostManagementModule { }
