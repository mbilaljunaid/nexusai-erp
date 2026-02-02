import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CostOrganization } from './cost-organization.entity';

@Entity('cst_cost_periods')
export class CostPeriod {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => CostOrganization)
    costOrganization!: CostOrganization;

    @Column({ type: 'varchar' })
    periodName!: string; // e.g., 'Jan-2026'

    @Column({ type: 'timestamp' })
    startDate!: Date;

    @Column({ type: 'timestamp' })
    endDate!: Date;

    @Column({ type: 'varchar', default: 'Open' })
    status!: string; // 'Open', 'Closed', 'Forever Closed', 'Future Entry'

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
