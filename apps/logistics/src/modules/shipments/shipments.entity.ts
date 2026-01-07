import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'shipments', schema: 'logistics' })
export class ShipmentEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'tenant_id' })
    tenantId: string;

    @Column('jsonb', { name: 'origin_json' })
    origin: any; // { address: string, lat: number, lng: number }

    @Column('jsonb', { name: 'destination_json' })
    destination: any; // { address: string, lat: number, lng: number }

    @Column('varchar', { length: 20 })
    status: string; // 'PLANNED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'EXCEPTION'

    @Column('uuid', { name: 'carrier_id', nullable: true })
    carrierId: string;

    @Column('uuid', { name: 'vehicle_id', nullable: true })
    vehicleId: string;

    @Column('timestamptz', { name: 'estimated_arrival', nullable: true })
    estimatedArrival: Date;

    @Column('timestamptz', { name: 'actual_arrival', nullable: true })
    actualArrival: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
