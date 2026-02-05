import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, Index } from 'typeorm';

@Entity('gl_balances_v2')
@Index(['ledgerId', 'periodName']) // Composite Index for Performance
export class GLBalance {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'ledger_id' })
    ledgerId!: string;

    @Column({ name: 'code_combination_id' })
    codeCombinationId!: string;

    @Column({ name: 'currency_code' })
    currencyCode!: string;

    @Column({ name: 'period_name' })
    periodName!: string;

    @Column({ name: 'period_year', type: 'int', nullable: true })
    periodYear?: number;

    @Column({ name: 'period_num', type: 'int', nullable: true })
    periodNum?: number;

    @Column('decimal', { name: 'period_net_dr', precision: 18, scale: 2, default: 0 })
    periodNetDr!: number;

    @Column('decimal', { name: 'period_net_cr', precision: 18, scale: 2, default: 0 })
    periodNetCr!: number;

    @Column('decimal', { name: 'begin_balance', precision: 18, scale: 2, default: 0 })
    beginBalance!: number;

    @Column('decimal', { name: 'end_balance', precision: 18, scale: 2, default: 0 })
    endBalance!: number;

    @Column({ name: 'translated_flag', default: false })
    translatedFlag!: boolean;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
