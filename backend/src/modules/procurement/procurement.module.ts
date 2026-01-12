import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { Supplier } from './entities/supplier.entity';
import { SupplierSite } from './entities/supplier-site.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderLine } from './entities/purchase-order-line.entity';
import { PurchaseOrderDistribution } from './entities/purchase-order-distribution.entity';
import { ReceiptHeader } from './entities/receipt-header.entity';
import { ReceiptLine } from './entities/receipt-line.entity';
import { RequisitionHeader } from './entities/requisition-header.entity';
import { RequisitionLine } from './entities/requisition-line.entity';
import { ApInvoice } from './entities/ap-invoice.entity';
import { ApInvoiceLine } from './entities/ap-invoice-line.entity';
import { ApPayment } from './entities/ap-payment.entity';
import { ApprovalRule } from './entities/approval-rule.entity';
import { RfqHeader } from './entities/rfq-header.entity';
import { RfqLine } from './entities/rfq-line.entity';
import { SupplierQuote } from './entities/supplier-quote.entity';
import { Item } from '../inventory/entities/item.entity';
import { Budget } from '../epm/entities/budget.entity';
import { ApprovalService } from './approval.service';
import { BudgetService } from '../epm/budget.service';
import { GlIntegrationService } from './gl-integration.service';
import { AiController } from './ai.controller';
import { ProcurementAiService } from './procurement-ai.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Supplier,
      SupplierSite,
      PurchaseOrder,
      PurchaseOrderLine,
      PurchaseOrderDistribution,
      ReceiptHeader,
      ReceiptLine,
      RequisitionHeader,
      RequisitionLine,
      ApInvoice,
      ApInvoiceLine,
      ApPayment,
      ApprovalRule,
      RfqHeader,
      RfqLine,
      SupplierQuote,
      Item,
      Budget
    ]),
  ],
  controllers: [PurchaseOrderController, SupplierController, ReceiptController, RequisitionController, ApController, SourcingController, AiController],
  providers: [PurchaseOrderService, SupplierService, ReceiptService, RequisitionService, ApService, ApprovalService, SourcingService, BudgetService, GlIntegrationService, ProcurementAiService],
  exports: [PurchaseOrderService, SupplierService, ReceiptService, RequisitionService, ApService, ApprovalService, SourcingService],
})
export class ProcurementModule { }
