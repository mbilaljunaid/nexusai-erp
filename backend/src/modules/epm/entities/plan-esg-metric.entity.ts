
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plan_esg_metrics')
export class PlanEsgMetric {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    versionId!: string;

    @Column({ type: 'varchar' })
    scenarioId!: string;

    @Column({ type: 'varchar' })
    period!: string;

    @Column({ type: 'varchar' })
    entityId!: string;

    @Column({ type: 'varchar' })
    metricCode!: string; // e.g., 'CO2_SCOPE1', 'DEI_FEMALE_PCT'

    @Column({ type: 'varchar', nullable: true })
    departmentId?: string;

    @Column('decimal', { precision: 18, scale: 4, default: 0 })
    value!: number;

    @Column({ type: 'varchar' })
    unit!: string; // e.g., 'KG', 'PCT', 'COUNT'

    @Column({ type: 'varchar', nullable: true })
    comment?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
