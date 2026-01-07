import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ schema: 'mfg_production', name: 'production_orders' })
export class ProductionOrderEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenant_id: string;

    @Column({ unique: true })
    order_number: string;

    @Column()
    product_item_id: string; // Foreign key to Inventory Item

    @Column({ type: 'decimal' })
    quantity: number;

    @Column({ nullable: true })
    status: string; // PLANNED, IN_PROGRESS, etc.

    @CreateDateColumn()
    created_at: Date;
}
