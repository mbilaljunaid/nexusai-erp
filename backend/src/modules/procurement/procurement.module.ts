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
import { Item } from '../inventory/entities/item.entity';

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
      Item
    ]),
  ],
  controllers: [PurchaseOrderController, SupplierController, ReceiptController, RequisitionController, ApController],
  providers: [PurchaseOrderService, SupplierService, ReceiptService, RequisitionService, ApService],
  exports: [PurchaseOrderService, SupplierService, ReceiptService, RequisitionService, ApService],
})
export class ProcurementModule { }
