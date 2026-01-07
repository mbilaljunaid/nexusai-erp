import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleEntity } from './vehicle.entity';
import { FleetService } from './fleet.service';
import { FleetController } from './fleet.controller';

@Module({
    imports: [TypeOrmModule.forFeature([VehicleEntity])],
    controllers: [FleetController],
    providers: [FleetService],
})
export class FleetModule { }
