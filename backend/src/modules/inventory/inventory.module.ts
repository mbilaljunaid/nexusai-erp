import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Item,
      InventoryOrganization,
      Subinventory,
      Locator,
      MaterialTransaction,
      OnHandBalance,
      Lot,
      Serial,
      CstTransactionCost
    ]),
  ],
  controllers: [ProductController, ItemController, InventoryOrganizationController],
  providers: [ProductService, ItemService, InventoryOrganizationService, InventoryTransactionService, CostingService, PlanningService],
  exports: [ProductService, ItemService, InventoryTransactionService, CostingService, PlanningService],
})
export class InventoryModule { }
