import { Module, forwardRef } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { InventoryOrganizationController } from './inventory-organization.controller';
import { InventoryOrganizationService } from './inventory-organization.service';
import { InventoryTransactionService } from './inventory-transaction.service';
import { InventoryPlanningService } from './planning.service';
import { ReservationService } from './reservation.service';
import { CycleCountService } from './cycle-count.service';
import { LotService } from './lot.service';
import { SerialService } from './serial.service';
import { LotSerialController } from './lot-serial.controller';
import { CostManagementModule } from '../cost-management/cost-management.module';
import { CarrierIntegrationService } from './carrier-integration.service';

@Module({
  imports: [
    forwardRef(() => CostManagementModule),
  ],
  controllers: [ProductController, ItemController, InventoryOrganizationController, LotSerialController],
  providers: [
    ProductService,
    ItemService,
    InventoryOrganizationService,
    InventoryTransactionService,
    InventoryPlanningService,
    ReservationService,
    CycleCountService,
    LotService,
    SerialService,
    CarrierIntegrationService,
  ],
  exports: [
    ProductService,
    ItemService,
    InventoryTransactionService,
    InventoryPlanningService,
    ReservationService,
    CycleCountService,
    LotService,
    SerialService,
    CarrierIntegrationService,
  ],
})
export class InventoryModule { }
