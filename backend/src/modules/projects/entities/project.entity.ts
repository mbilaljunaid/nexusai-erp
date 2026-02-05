import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('projects2')
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    name!: string;

    @Column({ type: 'varchar', nullable: true })
    description?: string;

    @Column({ type: 'varchar', default: 'DRAFT' })
    status!: string; // DRAFT, ACTIVE, ON_HOLD, COMPLETED, CANCELLED

    @Column({ type: 'varchar' })
    type!: string; // INTERNAL, BILLABLE, PRODUCT_DEV

    @Column({ name: 'start_date', type: 'timestamp', nullable: true })
    startDate?: Date;

    @Column({ name: 'end_date', type: 'timestamp', nullable: true })
    endDate?: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}
