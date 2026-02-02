import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RfqHeader } from './rfq-header.entity';
import { Supplier } from './supplier.entity';

@Entity('procure_supplier_quotes')
export class SupplierQuote {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => RfqHeader, (rfq) => rfq.quotes)
    rfq!: RfqHeader;

    @ManyToOne(() => Supplier)
    supplier!: Supplier;

    @Column({ type: 'decimal', precision: 18, scale: 2 })
    quoteAmount!: number;

    @Column({ type: 'varchar', default: 'Submitted' }) // Submitted, Awarded, Rejected
    status!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
