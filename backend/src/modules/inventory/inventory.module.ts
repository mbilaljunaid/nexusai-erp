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

@Module({
  imports: [
    TypeOrmModule.forFeature([Item, InventoryOrganization]),
  ],
  controllers: [ProductController, ItemController],
  providers: [ProductService, ItemService],
  exports: [ProductService, ItemService],
})
export class InventoryModule { }
