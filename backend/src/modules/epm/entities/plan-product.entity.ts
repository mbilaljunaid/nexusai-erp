
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plan_products')
export class PlanProduct {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    code!: string; // SKU or Product Code

    @Column()
    name!: string;

    @Column({ nullable: true })
    category?: string;

    @Column({ nullable: true })
    family?: string;

    @Column('decimal', { precision: 18, scale: 2, default: 0 })
    standardCost!: number;

    @Column('decimal', { precision: 18, scale: 2, default: 0 })
    listPrice!: number;

    @Column({ default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
