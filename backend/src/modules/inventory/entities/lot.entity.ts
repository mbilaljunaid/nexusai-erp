import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InventoryOrganization } from './inventory-organization.entity';
import { Item } from './item.entity';

@Entity('inv_lots')
export class Lot {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => InventoryOrganization)
    organization!: InventoryOrganization;

    @ManyToOne(() => Item)
    item!: Item;

    @Column({ type: 'varchar' })
    lotNumber!: string;

    @Column({ type: 'timestamp', nullable: true })
    expirationDate?: Date;

    @Column({ type: 'varchar', default: 'Active' })
    status!: string; // Active, On Hold, Expired

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
