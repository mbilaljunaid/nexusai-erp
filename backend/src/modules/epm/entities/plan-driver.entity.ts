import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plan_drivers')
export class PlanDriver {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    code!: string; // e.g., 'CPI_2024', 'MERIT_PCT'

    @Column()
    name!: string; // e.g., 'Consumer Price Index', 'Merit Increase %'

    @Column('decimal', { precision: 10, scale: 4 })
    value!: number; // e.g., 0.0350 for 3.5%

    @Column({ nullable: true })
    period?: string; // Optional: if driver is period-specific

    @Column({ nullable: true })
    description?: string;

    @Column({ default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
