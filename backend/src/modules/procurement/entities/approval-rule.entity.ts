import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('procure_approval_rules')
export class ApprovalRule {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    ruleName!: string;

    @Column()
    documentType!: string; // 'Requisition' | 'PurchaseOrder'

    @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
    minAmount!: number;

    @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
    maxAmount?: number;

    @Column({ nullable: true })
    categoryFilter?: string;

    @Column()
    approverId!: string; // User ID or Role

    @Column({ default: 1 })
    priority!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
