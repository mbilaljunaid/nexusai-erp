import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  departmentId!: string;

  @Column({ type: 'int' })
  year!: number;

  @Column({ type: 'int' })
  quarter!: number;

  @Column('decimal', { precision: 18, scale: 2 })
  allocatedAmount!: number;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  spentAmount!: number;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  reservedAmount!: number; // Encumbrance

  @Column({ type: 'varchar', default: 'draft' })
  status!: string;

  @Column({ type: 'varchar', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
