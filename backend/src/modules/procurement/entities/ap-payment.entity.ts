import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApInvoice } from './ap-invoice.entity';

@Entity('procure_ap_payments')
export class ApPayment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    paymentNumber!: string;

    @ManyToOne(() => ApInvoice, (invoice) => invoice.payments)
    invoice!: ApInvoice;

    @Column({ type: 'decimal', precision: 18, scale: 2 })
    amount!: number;

    @Column()
    paymentDate!: Date;

    @Column()
    paymentMethod!: string; // Check, Wire, EFT

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
