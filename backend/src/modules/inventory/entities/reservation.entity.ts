import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InventoryOrganization } from './inventory-organization.entity';
import { Item } from './item.entity';
import { Subinventory } from './subinventory.entity';
import { Locator } from './locator.entity';
import { Lot } from './lot.entity';
import { Serial } from './serial.entity';

@Entity('inv_reservations')
export class Reservation {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => InventoryOrganization)
    organization!: InventoryOrganization;

    @ManyToOne(() => Item)
    item!: Item;

    // Demand Source (What needs the stock?)
    @Column()
    demandSourceType!: string; // 'Sales Order', 'Work Order', 'Transfer Order'

    @Column()
    demandSourceHeaderId!: string; // e.g., Order ID

    @Column({ nullable: true })
    demandSourceLineId?: string; // e.g., Order Line ID

    // Supply Source (Where is the stock?)
    // If null, it's a "Soft" reservation against the Org/Item generally.
    // If populated, it's a "Hard" reservation against specific location/lot.
    @ManyToOne(() => Subinventory, { nullable: true })
    subinventory?: Subinventory;

    @ManyToOne(() => Locator, { nullable: true })
    locator?: Locator;

    @ManyToOne(() => Lot, { nullable: true })
    lot?: Lot;

    @ManyToOne(() => Serial, { nullable: true })
    serial?: Serial;

    @Column('decimal', { precision: 18, scale: 4 })
    quantity!: number;

    @Column()
    uom!: string;

    @Column({ default: 'Hard' })
    reservationType!: string; // 'Hard', 'Soft'

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
