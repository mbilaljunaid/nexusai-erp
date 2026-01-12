import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Supplier } from './supplier.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { ApInvoiceLine } from './ap-invoice-line.entity';
import { ApPayment } from './ap-payment.entity';

@Entity('procure_ap_invoices')
export class ApInvoice {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    invoiceNumber!: string;

    @ManyToOne(() => Supplier)
    supplier!: Supplier;

    @ManyToOne(() => PurchaseOrder, { nullable: true })
    purchaseOrder?: PurchaseOrder;

    @Column({ type: 'decimal', precision: 18, scale: 2 })
    amount!: number;

    @Column()
    invoiceDate!: Date;

    @Column({ nullable: true })
    dueDate?: Date;

    @Column({ nullable: true })
    paymentTerms?: string;

    @Column({ default: 'Draft' }) // Draft, Validated, Paid, Cancelled
    status!: string;

    @OneToMany(() => ApInvoiceLine, (line) => line.invoice, { cascade: true })
    lines!: ApInvoiceLine[];

    @OneToMany(() => ApPayment, (payment) => payment.invoice)
    payments!: ApPayment[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
