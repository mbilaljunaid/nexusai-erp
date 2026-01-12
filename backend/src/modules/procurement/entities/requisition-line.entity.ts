import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RequisitionHeader } from './requisition-header.entity';

@Entity('procure_requisition_lines')
export class RequisitionLine {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => RequisitionHeader, (header) => header.lines)
    header!: RequisitionHeader;

    @Column({ nullable: true })
    itemId?: string;

    @Column()
    description!: string;

    @Column({ nullable: true })
    categoryName?: string;

    @Column({ type: 'decimal', precision: 18, scale: 4 })
    quantity!: number;

    @Column({ type: 'decimal', precision: 18, scale: 4 })
    unitPrice!: number;

    @Column({ nullable: true })
    supplierId?: string; // Suggested Supplier

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
