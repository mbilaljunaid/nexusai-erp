import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { InventoryOrganization } from './inventory-organization.entity';
import { Item } from './item.entity';
import { MaterialTransaction } from './material-transaction.entity';

@Entity('cst_transaction_costs')
export class CstTransactionCost {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => InventoryOrganization)
    organization!: InventoryOrganization;

    @ManyToOne(() => Item)
    item!: Item;

    @ManyToOne(() => MaterialTransaction)
    transaction!: MaterialTransaction;

    @Column({ type: 'varchar' })
    costMethod!: string; // 'FIFO', 'Average', 'Standard'

    @Column('decimal', { precision: 18, scale: 4 })
    unitCost!: number;

    @Column('decimal', { precision: 18, scale: 4 })
    totalCost!: number;

    // For FIFO Layers
    @Column('decimal', { precision: 18, scale: 4, nullable: true })
    quantityRemaining?: number; // For Receipt layers consumed by issues

    @CreateDateColumn()
    createdAt!: Date;
}
