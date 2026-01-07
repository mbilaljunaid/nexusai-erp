import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Controller } from '@nestjs/common';

// ENTITY
@Entity({ name: 'routes', schema: 'logistics' })
export class RouteEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'tenant_id' })
    tenantId: string;

    @Column('uuid', { name: 'vehicle_id' })
    vehicleId: string;

    @Column('jsonb', { name: 'stops_json' })
    stops: any;
}

// CONTROLLER
@Controller('routes')
export class RoutesController { }

// MODULE
@Module({
    imports: [TypeOrmModule.forFeature([RouteEntity])],
    controllers: [RoutesController],
})
export class RoutesModule { }
