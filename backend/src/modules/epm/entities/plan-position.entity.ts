import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plan_positions')
export class PlanPosition {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    jobTitle!: string;

    @Column({ type: 'varchar' })
    departmentId!: string; // Link to Dept

    @Column({ type: 'varchar', nullable: true })
    employeeId?: string; // If existing employee

    @Column({ type: 'varchar' })
    startDate!: string; // YYYY-MM-DD

    @Column({ type: 'varchar', nullable: true })
    endDate?: string;

    @Column('decimal', { precision: 18, scale: 2 })
    annualSalary!: number;

    @Column('decimal', { precision: 5, scale: 2, default: 0.20 })
    benefitsPct!: number; // e.g. 0.20 for 20%

    @Column({ type: 'varchar', default: 'NEW' })
    status!: string; // NEW, EXISTING, TERMINATED

    @Column({ type: 'varchar' })
    versionId!: string; // Associated with a specific Plan Version

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
