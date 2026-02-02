import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InventoryOrganization } from './inventory-organization.entity';
import { Subinventory } from './subinventory.entity';
import { Item } from './item.entity';
import { Locator } from './locator.entity';

@Entity('inv_cycle_count_headers')
export class CycleCountHeader {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => InventoryOrganization)
    organization!: InventoryOrganization;

    @Column({ type: 'varchar' })
    cycleCountName!: string;

    @ManyToOne(() => Subinventory, { nullable: true })
    subinventory?: Subinventory; // Scope: specific subinventory or null for all

    @Column({ type: 'varchar', default: 'Draft' })
    status!: string; // 'Draft', 'InProgress', 'Completed', 'Approved'

    @CreateDateColumn()
    createdAt!: Date;

    @OneToMany(() => CycleCountEntry, entry => entry.header)
    entries!: CycleCountEntry[];
}

@Entity('inv_cycle_count_entries')
export class CycleCountEntry {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => CycleCountHeader, header => header.entries)
    header!: CycleCountHeader;

    @ManyToOne(() => Item)
    item!: Item;

    @ManyToOne(() => Subinventory)
    subinventory!: Subinventory;

    @ManyToOne(() => Locator, { nullable: true })
    locator?: Locator;

    // Snapshot of System Quantity at time of generation
    @Column('decimal', { precision: 18, scale: 4 })
    systemQuantity!: number;

    // Actual Counted Quantity
    @Column('decimal', { precision: 18, scale: 4, nullable: true })
    countedQuantity?: number;

    @Column({ type: 'varchar', default: 'Pending' })
    status!: string; // 'Pending', 'Counted', 'Recount', 'Adjusted'

    @UpdateDateColumn()
    updatedAt!: Date;
}
