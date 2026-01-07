import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ schema: 'logistics_fleet', name: 'vehicles' })
export class VehicleEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenant_id: string;

    @Column({ nullable: true })
    vin: string;

    @Column()
    plate_number: string;

    @Column({ default: 'TRUCK' })
    type: string;

    @Column({ default: 'AVAILABLE' })
    status: string; // AVAILABLE, IN_TRANSIT, MAINTENANCE
}
