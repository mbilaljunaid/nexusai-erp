import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plan_positions')
export class PlanPosition {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    jobTitle!: string;

    @Column()
    departmentId!: string; // Link to Dept

    @Column({ nullable: true })
    employeeId?: string; // If existing employee

    @Column()
    startDate!: string; // YYYY-MM-DD

    @Column({ nullable: true })
    endDate?: string;

    @Column('decimal', { precision: 18, scale: 2 })
    annualSalary!: number;

    @Column('decimal', { precision: 5, scale: 2, default: 0.20 })
    benefitsPct!: number; // e.g. 0.20 for 20%

    @Column({ default: 'NEW' })
    status!: string; // NEW, EXISTING, TERMINATED

    @Column()
    versionId!: string; // Associated with a specific Plan Version

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
