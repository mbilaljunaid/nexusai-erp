import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InventoryOrganization } from './inventory-organization.entity';

@Entity('inv_items')
export class Item {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    itemNumber!: string;

    @Column()
    description!: string;

    @Column({ nullable: true })
    primaryUomCode?: string; // e.g., 'EA', 'BOX'

    @Column({ nullable: true })
    categoryName?: string;

    @Column({ default: true })
    inventoryItem!: boolean;

    @Column({ default: true })
    purchasable!: boolean;

    @ManyToOne(() => InventoryOrganization)
    organization!: InventoryOrganization;

    @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
    quantityOnHand!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
