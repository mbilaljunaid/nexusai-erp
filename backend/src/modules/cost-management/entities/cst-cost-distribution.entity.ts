import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { MaterialTransaction } from '../../inventory/entities/material-transaction.entity';
import { CostOrganization } from './cost-organization.entity';
import { CostElement } from './cost-element.entity';

@Entity('cst_cost_distributions')
export class CstCostDistribution {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => MaterialTransaction)
    transaction!: MaterialTransaction;

    @ManyToOne(() => CostOrganization)
    costOrganization!: CostOrganization;

    @ManyToOne(() => CostElement, { nullable: true })
    costElement?: CostElement;

    @Column({ type: 'varchar' })
    accountingLineType!: string; // 'Inventory Valuation', 'COGS', 'WIP Valuation', 'Overhead Absorption'

    @Column('decimal', { precision: 18, scale: 4 })
    amount!: number;

    @Column({ type: 'varchar' })
    currencyCode!: string;

    @Column('decimal', { precision: 18, scale: 4 })
    unitCost!: number;

    @Column({ type: 'varchar', default: 'Draft' })
    status!: string; // Draft, Final, Posted

    @Column({ type: 'boolean', default: false })
    accounted!: boolean;

    @Column({ type: 'varchar', nullable: true })
    glAccountId?: string; // The resolved GL Account Code (CCID)

    @CreateDateColumn()
    createdAt!: Date;
}
