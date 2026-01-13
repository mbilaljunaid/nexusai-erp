import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InventoryOrganization } from './inventory-organization.entity';

@Entity('inv_items')
export class Item {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    itemNumber!: string;

    @Column({ type: 'varchar' })
    description!: string;

    @Column({ type: 'varchar', nullable: true })
    primaryUomCode?: string; // e.g., 'EA', 'BOX'

    @Column({ type: 'varchar', nullable: true })
    categoryName?: string;

    @Column({ type: 'boolean', default: true })
    inventoryItem!: boolean;

    @Column({ type: 'boolean', default: true })
    purchasable!: boolean;

    @ManyToOne(() => InventoryOrganization)
    organization!: InventoryOrganization;

    @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
    quantityOnHand!: number;

    // Planning Attributes
    @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
    minQuantity?: number;

    @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
    maxQuantity?: number;

    @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
    reorderQuantity?: number; // Fixed Order Qty

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
