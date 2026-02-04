import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plan_dimensions')
export class PlanDimension {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    code!: string; // e.g., 'CHANNEL', 'PROJECT'

    @Column()
    name!: string; // e.g., 'Sales Channel'

    @Column()
    type!: string; // 'Standard' or 'Custom'

    @Column({ default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
