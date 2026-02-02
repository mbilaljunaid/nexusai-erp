import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { Item } from './entities/item.entity';
import { InventoryOrganization } from './entities/inventory-organization.entity';
import { InventoryOrganizationController } from './inventory-organization.controller';
import { InventoryOrganizationService } from './inventory-organization.service';
import { Subinventory } from './entities/subinventory.entity';
import { Locator } from './entities/locator.entity';
import { MaterialTransaction } from './entities/material-transaction.entity';
import { OnHandBalance } from './entities/on-hand-balance.entity';
import { Lot } from './entities/lot.entity';
import { Serial } from './entities/serial.entity';
import { InventoryTransactionService } from './inventory-transaction.service';

import { CstTransactionCost } from './entities/cst-transaction-cost.entity';
import { CostingService } from './costing.service';
import { PlanningService } from './planning.service';
import { Reservation } from './entities/reservation.entity';
import { ReservationService } from './reservation.service';
import { CycleCountHeader, CycleCountEntry } from './entities/cycle-count.entity';
import { CycleCountService } from './cycle-count.service';
import { CostManagementModule } from '../cost-management/cost-management.module';
import { LotService } from './lot.service';
import { SerialService } from './serial.service';
import { LotSerialController } from './lot-serial.controller';

@Module({
  imports: [
    forwardRef(() => CostManagementModule),
    TypeOrmModule.forFeature([
      Item,
      InventoryOrganization,
      Subinventory,
      Locator,
      MaterialTransaction,
      OnHandBalance,
      Lot,
      Serial,
      CstTransactionCost,
      Reservation,
      CycleCountHeader,
      CycleCountEntry
    ]),
  ],
  controllers: [ProductController, ItemController, InventoryOrganizationController, LotSerialController],
  providers: [
    ProductService,
    ItemService,
    InventoryOrganizationService,
    InventoryTransactionService,
    CostingService,
    PlanningService,
    ReservationService,
    CycleCountService,
    LotService,
    SerialService
  ],
  exports: [
    ProductService,
    ItemService,
    InventoryTransactionService,
    CostingService,
    PlanningService,
    ReservationService,
    CycleCountService,
    LotService,
    SerialService,
    TypeOrmModule // Export repositories
  ],
})
export class InventoryModule { }
