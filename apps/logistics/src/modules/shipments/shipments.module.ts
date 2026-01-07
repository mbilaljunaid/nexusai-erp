import { Module } from '@nestjs/common';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from '@contracts/logistics/logistics.models';

@Module({
    imports: [TypeOrmModule.forFeature([Shipment])],
    controllers: [ShipmentsController],
    providers: [ShipmentsService],
})
export class ShipmentsModule { }
