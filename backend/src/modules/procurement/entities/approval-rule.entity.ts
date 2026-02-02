import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('procure_approval_rules')
export class ApprovalRule {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    ruleName!: string;

    @Column({ type: 'varchar' })
    documentType!: string; // 'Requisition' | 'PurchaseOrder'

    @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
    minAmount!: number;

    @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
    maxAmount?: number;

    @Column({ type: 'varchar', nullable: true })
    categoryFilter?: string;

    @Column({ type: 'varchar' })
    approverId!: string; // User ID or Role

    @Column({ type: 'int', default: 1 })
    priority!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
