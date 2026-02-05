
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('plan_units')
@Index(['versionId', 'scenarioId', 'period']) // Core lookup index
@Index(['entityId', 'departmentId', 'accountId']) // Aggregation index
export class PlanUnit {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    versionId!: string;

    @Column({ type: 'varchar' })
    scenarioId!: string;

    @Column({ type: 'varchar' })
    period!: string; // YYYY-MM

    @Column({ type: 'varchar' })
    entityId!: string; // Company / Legal Entity

    @Column({ type: 'varchar' })
    departmentId!: string; // Cost Center

    @Column({ type: 'varchar' })
    accountId!: string; // GL Account or Driver ID

    @Column({ type: 'varchar', nullable: true })
    projectId?: string; // New Dimension: Project

    @Column({ type: 'varchar', nullable: true })
    channelId?: string; // New Dimension: Channel (Sales Channel)

    @Column({ name: 'product_id', type: 'varchar', nullable: true })
    productId?: string; // New Dimension: S&OP Product

    @Column('decimal', { precision: 18, scale: 2, default: 0 })
    amount!: number;

    @Column({ type: 'varchar', nullable: true })
    currency?: string;

    @Column({ type: 'varchar', default: 'DRAFT' })
    status!: string; // DRAFT, CALCULATED, APPROVED, LOCKED

    @Column({ type: 'varchar', nullable: true })
    comment?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
