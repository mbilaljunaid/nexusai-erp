import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { PlanVersion } from './plan-version.entity';
import { PlanScenario } from './plan-scenario.entity';

@Entity('plan_units')
@Index(['scenarioId', 'versionId', 'period', 'entityId', 'departmentId', 'accountId'], { unique: true }) // Composite unique key for the cube intersection
export class PlanUnit {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    scenarioId!: string;

    @ManyToOne(() => PlanScenario)
    @JoinColumn({ name: 'scenarioId' })
    scenario!: PlanScenario;

    @Column()
    versionId!: string;

    @ManyToOne(() => PlanVersion)
    @JoinColumn({ name: 'versionId' })
    version!: PlanVersion;

    @Column()
    period!: string; // Format: YYYY-MM or YYYY-Q#

    @Column()
    entityId!: string; // Link to Organization Unit

    @Column()
    departmentId!: string; // Link to Department

    @Column()
    accountId!: string; // Link to GL Account

    // Optional dimensions for expansion
    @Column({ nullable: true })
    productId?: string;

    @Column({ nullable: true })
    projectId?: string;

    @Column('decimal', { precision: 20, scale: 2, default: 0 })
    amount!: number;

    @Column({ default: 'USD' })
    currency!: string;

    @Column({ length: 50, default: 'DRAFT' })
    status!: string; // DRAFT, PENDING, APPROVED

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
