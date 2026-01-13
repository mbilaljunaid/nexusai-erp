import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { WorkOrder } from '../../manufacturing/entities/work-order.entity';
import { InventoryOrganization } from '../../inventory/entities/inventory-organization.entity';
import { Item } from '../../inventory/entities/item.entity';

export type WipTransactionType = 'Material Issue' | 'Resource Charge' | 'Completion' | 'Scrap';

@Entity('cst_wip_transactions')
export class WipTransaction {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => InventoryOrganization)
    organization!: InventoryOrganization;

    @ManyToOne(() => WorkOrder)
    workOrder!: WorkOrder;

    @Column({ type: 'varchar' })
    transactionType!: WipTransactionType;

    @ManyToOne(() => Item, { nullable: true })
    item?: Item; // Component Item for Issues, Assembly Item for Completion

    @Column('decimal', { precision: 18, scale: 4 })
    quantity!: number;

    @Column({ type: 'varchar' })
    uom!: string;

    @Column('decimal', { precision: 18, scale: 4 })
    unitCost!: number;

    @Column('decimal', { precision: 18, scale: 4 })
    totalCost!: number;

    @Column({ type: 'varchar' })
    currencyCode!: string;

    @CreateDateColumn()
    transactionDate!: Date;
}
