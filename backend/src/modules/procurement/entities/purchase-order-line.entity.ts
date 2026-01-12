import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { PurchaseOrderDistribution } from './purchase-order-distribution.entity';

@Entity('procure_po_lines')
export class PurchaseOrderLine {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    lineNumber!: number;

    @Column({ nullable: true })
    itemId?: string; // Reference to Item ID (loose coupling or relation if cross-module)

    @Column({ nullable: true })
    itemDescription?: string;

    @Column()
    categoryName!: string;

    @Column({ type: 'decimal', precision: 18, scale: 4 })
    quantity!: number;

    @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
    quantityReceived!: number;

    @Column({ type: 'decimal', precision: 18, scale: 4 })
    unitPrice!: number;

    @Column({ nullable: true })
    uom!: string;

    @Column({ type: 'decimal', precision: 18, scale: 2 })
    lineAmount!: number;

    @ManyToOne(() => PurchaseOrder, (po) => po.lines)
    purchaseOrder!: PurchaseOrder;

    @OneToMany(() => PurchaseOrderDistribution, (dist) => dist.line, { cascade: true })
    distributions!: PurchaseOrderDistribution[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
