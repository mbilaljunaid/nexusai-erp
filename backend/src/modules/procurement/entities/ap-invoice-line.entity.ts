import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApInvoice } from './ap-invoice.entity';
import { PurchaseOrderLine } from './purchase-order-line.entity';

@Entity('procure_ap_invoice_lines')
export class ApInvoiceLine {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => ApInvoice, (invoice) => invoice.lines)
    invoice!: ApInvoice;

    @Column({ type: 'varchar' })
    description!: string;

    @Column({ type: 'decimal', precision: 18, scale: 2 })
    amount!: number;

    @ManyToOne(() => PurchaseOrderLine, { nullable: true })
    poLine?: PurchaseOrderLine;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
