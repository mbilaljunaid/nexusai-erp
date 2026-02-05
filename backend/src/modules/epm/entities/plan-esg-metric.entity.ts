
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plan_esg_metrics')
export class PlanEsgMetric {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    versionId!: string;

    @Column()
    scenarioId!: string;

    @Column()
    period!: string;

    @Column()
    entityId!: string;

    @Column()
    metricCode!: string; // e.g., 'CO2_SCOPE1', 'DEI_FEMALE_PCT'

    @Column({ nullable: true })
    departmentId?: string;

    @Column('decimal', { precision: 18, scale: 4, default: 0 })
    value!: number;

    @Column()
    unit!: string; // e.g., 'KG', 'PCT', 'COUNT'

    @Column({ nullable: true })
    comment?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
