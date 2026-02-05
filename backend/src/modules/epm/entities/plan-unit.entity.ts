
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('plan_units')
@Index(['versionId', 'scenarioId', 'period']) // Core lookup index
@Index(['entityId', 'departmentId', 'accountId']) // Aggregation index
export class PlanUnit {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    versionId!: string;

    @Column()
    scenarioId!: string;

    @Column()
    period!: string; // YYYY-MM

    @Column()
    entityId!: string; // Company / Legal Entity

    @Column()
    departmentId!: string; // Cost Center

    @Column()
    accountId!: string; // GL Account or Driver ID

    @Column({ nullable: true })
    projectId?: string; // New Dimension: Project

    @Column({ nullable: true })
    channelId?: string; // New Dimension: Channel (Sales Channel)

    @Column({ name: 'product_id', nullable: true })
    productId?: string; // New Dimension: S&OP Product

    @Column('decimal', { precision: 18, scale: 2, default: 0 })
    amount!: number;

    @Column({ nullable: true })
    currency?: string;

    @Column({ default: 'DRAFT' })
    status!: string; // DRAFT, CALCULATED, APPROVED, LOCKED

    @Column({ nullable: true })
    comment?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
