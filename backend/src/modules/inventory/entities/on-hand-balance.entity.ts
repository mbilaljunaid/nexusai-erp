import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InventoryOrganization } from './inventory-organization.entity';
import { Item } from './item.entity';
import { Subinventory } from './subinventory.entity';
import { Locator } from './locator.entity';
import { Lot } from './lot.entity';
import { Serial } from './serial.entity';

@Entity('inv_on_hand_balances')
export class OnHandBalance {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => InventoryOrganization)
    organization!: InventoryOrganization;

    @ManyToOne(() => Item)
    item!: Item;

    @ManyToOne(() => Subinventory)
    subinventory!: Subinventory;

    @ManyToOne(() => Locator, { nullable: true })
    locator?: Locator;

    @ManyToOne(() => Lot, { nullable: true })
    lot?: Lot;

    @ManyToOne(() => Serial, { nullable: true })
    serial?: Serial;

    @Column('decimal', { precision: 18, scale: 4, default: 0 })
    quantity!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
