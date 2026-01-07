import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ERPController } from './erp.controller';
import { ERPService } from './erp.service';
import { LeadEntity, EmployeeEntity, InvoiceEntity, ItemEntity, SupplierEntity, PurchaseOrderEntity, ProjectEntity, TaskEntity } from './erp.entities';

@Module({
    imports: [TypeOrmModule.forFeature([
        LeadEntity, EmployeeEntity, InvoiceEntity,
        ItemEntity, SupplierEntity, PurchaseOrderEntity,
        ProjectEntity, TaskEntity
    ])],
    controllers: [ERPController],
    providers: [ERPService],
})
export class ERPModule { }
