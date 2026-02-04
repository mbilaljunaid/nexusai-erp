import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PlanScenario } from './plan-scenario.entity';

@Entity('plan_versions')
export class PlanVersion {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    code!: string; // e.g., 'V1', 'WORKING', 'FINAL'

    @Column()
    name!: string; // e.g., 'Initial Draft', 'Board Approved'

    @Column()
    scenarioId!: string;

    @ManyToOne(() => PlanScenario)
    @JoinColumn({ name: 'scenarioId' })
    scenario!: PlanScenario;

    @Column({ default: false })
    isLocked!: boolean; // If true, no edits allowed

    @Column({ default: false })
    isFinal!: boolean; // Official version for reporting

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
