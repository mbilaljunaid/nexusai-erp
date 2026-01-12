import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InventoryOrganization } from './inventory-organization.entity';

@Entity('inv_subinventories')
export class Subinventory {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    code!: string; // e.g., 'RAW', 'FG', 'STORES'

    @Column()
    name!: string;

    @ManyToOne(() => InventoryOrganization)
    organization!: InventoryOrganization;

    @Column({ default: true })
    active!: boolean;

    @Column({ default: false })
    assetInventory!: boolean; // If false, expensed on receipt

    @Column({ default: false })
    locatorControl!: boolean; // If true, txns must specify Locator

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
