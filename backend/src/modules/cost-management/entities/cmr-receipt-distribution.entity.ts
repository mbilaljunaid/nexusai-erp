import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { MaterialTransaction } from '../../inventory/entities/material-transaction.entity';
import { CostOrganization } from './cost-organization.entity';

@Entity('cmr_receipt_distributions')
export class CmrReceiptDistribution {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => MaterialTransaction)
    transaction!: MaterialTransaction;

    @ManyToOne(() => CostOrganization)
    costOrganization!: CostOrganization;

    @Column({ type: 'varchar' })
    accountingLineType!: string; // 'Accrual', 'Inventory Valuation', 'IPV', 'ERV' (Exchange Rate Variance)

    @Column('decimal', { precision: 18, scale: 4 })
    amount!: number;

    @Column({ type: 'varchar' })
    currencyCode!: string;

    @Column('decimal', { precision: 18, scale: 4, nullable: true })
    accountedAmount?: number; // In Functional Currency

    @Column({ type: 'varchar', nullable: true })
    glAccountId?: string; // Link to GL Code Combination

    @Column({ type: 'varchar', default: 'Draft' })
    status!: string; // Draft, Final, Posted

    @CreateDateColumn()
    createdAt!: Date;
}
