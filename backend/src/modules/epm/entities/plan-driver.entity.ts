import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plan_drivers')
export class PlanDriver {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true, type: 'varchar' })
    code!: string; // e.g., 'CPI_2024', 'MERIT_PCT'

    @Column({ type: 'varchar' })
    name!: string; // e.g., 'Consumer Price Index', 'Merit Increase %'

    @Column('decimal', { precision: 10, scale: 4 })
    value!: number; // e.g., 0.0350 for 3.5%

    @Column({ type: 'varchar', nullable: true })
    period?: string; // Optional: if driver is period-specific

    @Column({ type: 'varchar', nullable: true })
    description?: string;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
