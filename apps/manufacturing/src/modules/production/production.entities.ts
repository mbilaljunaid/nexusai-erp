import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'items', schema: 'manufacturing' })
export class ItemEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'tenant_id' })
    tenantId: string;

    @Column()
    sku: string;

    @Column()
    name: string;

    @Column()
    type: string; // 'RM', 'WIP', 'FG'

    @Column()
    uom: string;

    @Column('decimal', { name: 'standard_cost', default: 0 })
    standardCost: number;
}

@Entity({ name: 'production_orders', schema: 'manufacturing' })
export class ProductionOrderEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'tenant_id' })
    tenantId: string;

    @Column({ name: 'order_number' })
    orderNumber: string;

    @Column('uuid', { name: 'item_id' })
    itemId: string;

    @Column('decimal')
    quantity: number;

    @Column()
    status: string; // 'PLANNED', 'RELEASED'

    @Column({ name: 'start_date', type: 'date' })
    startDate: string;

    @Column({ name: 'due_date', type: 'date' })
    dueDate: string;
}
