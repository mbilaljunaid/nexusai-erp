import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InventoryOrganization } from './inventory-organization.entity';
import { Item } from './item.entity';

@Entity('inv_serials')
export class Serial {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => InventoryOrganization)
    organization!: InventoryOrganization;

    @ManyToOne(() => Item)
    item!: Item;

    @Column()
    serialNumber!: string;

    @Column({ default: 'Active' })
    status!: string; // Active, Issued, Resides in Stores

    @Column({ nullable: true })
    currentSubinventoryId?: string;

    @Column({ nullable: true })
    currentLocatorId?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
