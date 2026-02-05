import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plan_dimensions')
export class PlanDimension {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true, type: 'varchar' })
    code!: string; // e.g., 'CHANNEL', 'PROJECT'

    @Column({ type: 'varchar' })
    name!: string; // e.g., 'Sales Channel'

    @Column({ type: 'varchar' })
    type!: string; // 'Standard' or 'Custom'

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
