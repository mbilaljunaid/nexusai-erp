import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InventoryOrganization } from '../../inventory/entities/inventory-organization.entity';
import { Item } from '../../inventory/entities/item.entity';

@Entity('mfg_work_orders')
export class WorkOrder {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => InventoryOrganization)
    organization!: InventoryOrganization;

    @Column({ type: 'varchar', unique: true })
    workOrderNumber!: string;

    @ManyToOne(() => Item)
    item!: Item;

    @Column('decimal', { precision: 18, scale: 4 })
    quantity!: number; // Planned Quantity

    @Column('decimal', { precision: 18, scale: 4, default: 0 })
    completedQuantity!: number;

    @Column({ type: 'varchar', default: 'Released' })
    status!: string; // Released, Completed, Closed, Cancelled

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
