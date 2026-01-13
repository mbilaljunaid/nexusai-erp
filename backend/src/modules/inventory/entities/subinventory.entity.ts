import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InventoryOrganization } from './inventory-organization.entity';

@Entity('inv_subinventories')
export class Subinventory {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    code!: string; // e.g., 'RAW', 'FG', 'STORES'

    @Column({ type: 'varchar' })
    name!: string;

    @ManyToOne(() => InventoryOrganization)
    organization!: InventoryOrganization;

    @Column({ type: 'boolean', default: true })
    active!: boolean;

    @Column({ type: 'boolean', default: false })
    assetInventory!: boolean; // If false, expensed on receipt

    @Column({ type: 'boolean', default: false })
    locatorControl!: boolean; // If true, txns must specify Locator

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
