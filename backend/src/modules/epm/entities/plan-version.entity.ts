import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PlanScenario } from './plan-scenario.entity';

@Entity('plan_versions')
export class PlanVersion {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    code!: string; // e.g., 'V1', 'WORKING', 'FINAL'

    @Column({ type: 'varchar' })
    name!: string; // e.g., 'Initial Draft', 'Board Approved'

    @Column({ type: 'varchar' })
    scenarioId!: string;

    @ManyToOne(() => PlanScenario)
    @JoinColumn({ name: 'scenarioId' })
    scenario!: PlanScenario;

    @Column({ type: 'boolean', default: false })
    isLocked!: boolean; // If true, no edits allowed

    @Column({ type: 'boolean', default: false })
    isFinal!: boolean; // Official version for reporting

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
