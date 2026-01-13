import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cst_cost_books')
export class CostBook {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', unique: true })
    costBookCode!: string; // e.g., 'primary_book', 'ifrs_book'

    @Column({ type: 'varchar' })
    description!: string;

    @Column({ type: 'varchar' })
    currencyCode!: string; // USD, EUR

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
