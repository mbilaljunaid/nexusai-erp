import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { CostOrganization } from './cost-organization.entity';
import { CstStandardCost } from './cst-standard-cost.entity';

export type ScenarioType = 'Current' | 'Pending' | 'Frozen' | 'Historical';

@Entity('cst_cost_scenarios')
export class CostScenario {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => CostOrganization)
    costOrganization!: CostOrganization;

    @Column({ type: 'varchar' })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'varchar', default: 'Pending' })
    scenarioType!: ScenarioType;

    @Column({ type: 'timestamp', nullable: true })
    effectiveDate?: Date;

    @OneToMany(() => CstStandardCost, (cost: CstStandardCost) => cost.scenario)
    costs!: CstStandardCost[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
