
import { Module, forwardRef } from '@nestjs/common';
import { PurchaseOrderController } from './purchase-order.controller';
import { PurchaseOrderService } from './purchase-order.service';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';
import { RequisitionController } from './requisition.controller';
import { RequisitionService } from './requisition.service';
import { ApController } from './ap.controller';
import { ApService } from './ap.service';
import { SourcingController } from './sourcing.controller';
import { SourcingService } from './sourcing.service';
import { ProcurementApprovalService } from './approval.service';
import { ProcurementGlIntegrationService } from './gl-integration.service';
import { AiController } from './ai.controller';
import { RfqService } from './rfq.service';
import { SupplierPortalService } from './supplier-portal.service';
import { TaxEngineService } from '../erp/tax-engine.service';
import { MdmAnomalyDetectionService } from './mdm-anomaly-detection.service';
// Entities removed

import { InventoryModule } from '../inventory/inventory.module';
import { EPMModule } from '../epm/epm.module';

@Module({
  imports: [
    InventoryModule,
    forwardRef(() => EPMModule)
  ],
  controllers: [PurchaseOrderController, SupplierController, ReceiptController, RequisitionController, ApController, SourcingController, AiController],
  providers: [
    PurchaseOrderService,
    SupplierService,
    ReceiptService,
    RequisitionService,
    ApService,
    ProcurementApprovalService,
    { provide: 'ProcurementApprovalService', useClass: ProcurementApprovalService },
    ProcurementGlIntegrationService,
    { provide: 'ProcurementGlIntegrationService', useClass: ProcurementGlIntegrationService },
    TaxEngineService,
    RfqService,
    SupplierPortalService,
    MdmAnomalyDetectionService,
  ],
  exports: [PurchaseOrderService, SupplierService, ReceiptService, RequisitionService, ApService, ProcurementApprovalService, SourcingService, TaxEngineService, MdmAnomalyDetectionService],
})
export class ProcurementModule { }
