import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionOrderEntity } from './production_order.entity';
import { ProductionService } from './production.service';
import { ProductionController } from './production.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ProductionOrderEntity])],
    controllers: [ProductionController],
    providers: [ProductionService],
})
export class ProductionModule { }
