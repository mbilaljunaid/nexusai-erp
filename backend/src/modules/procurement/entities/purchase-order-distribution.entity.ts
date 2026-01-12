import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PurchaseOrderLine } from './purchase-order-line.entity';

@Entity('procure_po_distributions')
export class PurchaseOrderDistribution {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    distributionNumber!: number;

    @Column({ type: 'decimal', precision: 18, scale: 4 })
    quantity!: number;

    @Column({ type: 'decimal', precision: 18, scale: 2 })
    amount!: number;

    @Column({ nullable: true })
    chargeAccountParams?: string; // Storing as JSON or string params for GL integration for now

    @ManyToOne(() => PurchaseOrderLine, (line) => line.distributions)
    line!: PurchaseOrderLine;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
