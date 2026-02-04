import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plan_scenarios')
export class PlanScenario {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    code!: string; // e.g., 'ACTUAL', 'BUDGET_2024'

    @Column()
    name!: string; // e.g., 'Actuals', 'Budget 2024'

    @Column({ nullable: true })
    description?: string;

    @Column({ default: false })
    isSystem!: boolean; // System scenarios cannot be deleted

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
