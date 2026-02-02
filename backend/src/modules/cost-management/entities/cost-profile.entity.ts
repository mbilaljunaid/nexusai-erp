import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CostMethod {
    STANDARD = 'Standard',
    AVERAGE = 'Average',
    FIFO = 'FIFO',
    LIFO = 'LIFO'
}

@Entity('cst_cost_profiles')
export class CostProfile {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', unique: true })
    profileName!: string;

    @Column({ type: 'varchar' })
    description!: string;

    @Column({
        type: 'enum',
        enum: CostMethod,
        default: CostMethod.AVERAGE
    })
    costMethod!: CostMethod;

    // Rules for receipt, issue, etc. can be added as JSON or separate columns
    @Column({ type: 'boolean', default: true })
    isDefault!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
