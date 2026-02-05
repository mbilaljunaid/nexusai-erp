
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plan_products')
export class PlanProduct {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true, type: 'varchar' })
    code!: string; // SKU or Product Code

    @Column({ type: 'varchar' })
    name!: string;

    @Column({ type: 'varchar', nullable: true })
    category?: string;

    @Column({ type: 'varchar', nullable: true })
    family?: string;

    @Column('decimal', { precision: 18, scale: 2, default: 0 })
    standardCost!: number;

    @Column('decimal', { precision: 18, scale: 2, default: 0 })
    listPrice!: number;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
