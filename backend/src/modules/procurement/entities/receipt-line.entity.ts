import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ReceiptHeader } from './receipt-header.entity';
import { PurchaseOrderLine } from './purchase-order-line.entity';

@Entity('procure_receipt_lines')
export class ReceiptLine {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => ReceiptHeader, (header) => header.lines)
    header!: ReceiptHeader;

    @ManyToOne(() => PurchaseOrderLine)
    poLine!: PurchaseOrderLine;

    @Column({ nullable: true })
    itemId?: string;

    @Column({ type: 'decimal', precision: 18, scale: 4 })
    quantityReceived!: number;

    @Column({ nullable: true })
    inventoryOrganizationId?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
