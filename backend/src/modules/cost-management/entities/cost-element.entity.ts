import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CostElementType {
    MATERIAL = 'Material',
    MATERIAL_OVERHEAD = 'Material Overhead',
    RESOURCE = 'Resource',
    OUTSIDE_PROCESSING = 'Outside Processing',
    OVERHEAD = 'Overhead'
}

@Entity('cst_cost_elements')
export class CostElement {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', unique: true })
    costElementCode!: string; // e.g., 'MAT-STEEL', 'LAB-ASSEMBLY'

    @Column({ type: 'varchar' })
    description!: string;

    @Column({
        type: 'enum',
        enum: CostElementType,
        default: CostElementType.MATERIAL
    })
    elementType!: CostElementType;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}
