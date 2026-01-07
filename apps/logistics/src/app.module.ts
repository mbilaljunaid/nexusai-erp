import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FleetModule } from './modules/fleet/fleet.module';
import { VehicleEntity } from './modules/fleet/vehicle.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URL || 'postgres://neondb_owner:npg_6M0btqPoxvTy@ep-purple-recipe-a8596645-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
            entities: [VehicleEntity],
            synchronize: false, // Schema managed by script
        }),
        FleetModule,
    ],
})
export class AppModule { }
