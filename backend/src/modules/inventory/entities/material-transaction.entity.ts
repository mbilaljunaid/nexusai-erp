import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { InventoryOrganization } from './inventory-organization.entity';
import { Item } from './item.entity';
import { Subinventory } from './subinventory.entity';
import { Locator } from './locator.entity';
import { Lot } from './lot.entity';
import { Serial } from './serial.entity';

@Entity('inv_material_transactions')
export class MaterialTransaction {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => InventoryOrganization)
    organization!: InventoryOrganization;

    @ManyToOne(() => Item)
    item!: Item;

    @Column()
    transactionType!: string; // 'PO Receipt', 'Subinv Transfer', 'Misc Issue', 'Sales Order Issue'

    @Column()
    transactionDate!: Date;

    @Column('decimal', { precision: 18, scale: 4 })
    quantity!: number; // Positive for Receipt, Negative for Issue

    @Column({ nullable: true })
    uom!: string;

    @ManyToOne(() => Subinventory, { nullable: true })
    subinventory?: Subinventory;

    @ManyToOne(() => Locator, { nullable: true })
    locator?: Locator;

    @ManyToOne(() => Lot, { nullable: true })
    lot?: Lot;

    @ManyToOne(() => Serial, { nullable: true })
    serial?: Serial;

    // Transfer Destination (for moves)
    @ManyToOne(() => Subinventory, { nullable: true })
    transferSubinventory?: Subinventory;

    @ManyToOne(() => Locator, { nullable: true })
    transferLocator?: Locator;

    @Column({ nullable: true })
    sourceDocumentType?: string; // 'PO', 'SO', 'WO'

    @Column({ nullable: true })
    sourceDocumentId?: string; // e.g. PO Line ID

    @Column({ nullable: true })
    reference?: string;

    @CreateDateColumn()
    createdAt!: Date;
}
