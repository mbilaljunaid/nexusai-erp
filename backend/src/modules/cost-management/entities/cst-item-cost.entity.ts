import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InventoryOrganization } from '../../inventory/entities/inventory-organization.entity';
import { Item } from '../../inventory/entities/item.entity';
import { CostBook } from './cost-book.entity';

@Entity('cst_item_costs')
@Unique(['inventoryOrganization', 'item', 'costBook'])
export class CstItemCost {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => InventoryOrganization)
    inventoryOrganization!: InventoryOrganization;

    @ManyToOne(() => Item)
    item!: Item;

    @ManyToOne(() => CostBook)
    costBook!: CostBook;

    @Column('decimal', { precision: 18, scale: 4, default: 0 })
    unitCost!: number;

    @Column({ type: 'varchar' })
    currencyCode!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
