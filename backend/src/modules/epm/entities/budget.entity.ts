import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  departmentId!: string;

  @Column()
  year!: number;

  @Column()
  quarter!: number;

  @Column('decimal', { precision: 18, scale: 2 })
  allocatedAmount!: number;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  spentAmount!: number;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  reservedAmount!: number; // Encumbrance

  @Column({ default: 'draft' })
  status!: string;

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
