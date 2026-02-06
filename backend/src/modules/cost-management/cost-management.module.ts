import { Module, forwardRef } from '@nestjs/common';
import { CostManagementService } from './cost-management.service';
import { ReceiptAccountingService } from './receipt-accounting.service';
import { CostProcessorService } from './cost-processor.service';
import { CostManagementController } from './cost-management.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { SlaService } from './sla.service';
import { FinanceModule } from '../finance/finance.module';

import { CostPeriodService } from './cost-period.service';
import { ReconciliationService } from './reconciliation.service';
import { StandardCostService } from './standard-cost.service';
import { LcmService } from './lcm.service';
import { WipCostingService } from './wip-costing.service';
import { CostAnomalyService } from './cost-anomaly.service';
import { CostApprovalService } from './approval.service';

@Module({
    imports: [
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
        LcmService,
        WipCostingService,
        SlaService,
        CostProcessorService,
        CostAnomalyService,
        CostApprovalService
    ],
    exports: [
        CostManagementService,
        ReceiptAccountingService,
        CostProcessorService,
        SlaService,
        CostPeriodService,
        ReconciliationService,
        StandardCostService,
        LcmService,
        WipCostingService,
        CostAnomalyService,
        CostApprovalService
    ],
})
export class CostManagementModule { }
