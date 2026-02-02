import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { ReceiptLine } from './receipt-line.entity';

@Entity('procure_receipt_headers')
export class ReceiptHeader {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', unique: true })
    receiptNumber!: string;

    @ManyToOne(() => PurchaseOrder)
    purchaseOrder!: PurchaseOrder;

    @Column({ type: 'timestamp' })
    receiptDate!: Date;

    @Column({ type: 'varchar', default: 'Received' })
    status!: string;

    @Column({ type: 'varchar', default: 'Pending' }) // Pending, Accounted
    accountingStatus!: string;

    @OneToMany(() => ReceiptLine, (line) => line.header, { cascade: true })
    lines!: ReceiptLine[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
