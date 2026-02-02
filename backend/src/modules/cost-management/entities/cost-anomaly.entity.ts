import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { InventoryOrganization } from '../../inventory/entities/inventory-organization.entity';
import { Item } from '../../inventory/entities/item.entity';

export enum AnomalySeverity {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    CRITICAL = 'Critical'
}

@Entity('cst_anomalies')
export class CostAnomaly {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => InventoryOrganization)
    organization!: InventoryOrganization;

    @ManyToOne(() => Item, { nullable: true })
    item!: Item;

    @Column({ type: 'varchar' })
    anomalyType!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    detectedValue!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    expectedValue!: number;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    variancePercent!: number;

    @Column({ type: 'enum', enum: AnomalySeverity, default: AnomalySeverity.MEDIUM })
    severity!: AnomalySeverity;

    @Column({ type: 'text', nullable: true })
    details!: string;

    @Column({ type: 'varchar', default: 'Open' })
    status!: string;

    @CreateDateColumn()
    detectedAt!: Date;
}
