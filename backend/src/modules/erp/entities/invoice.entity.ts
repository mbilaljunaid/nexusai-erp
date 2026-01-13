import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  invoiceNumber!: string;

  @Column({ type: 'varchar' })
  customerId!: string;

  @Column({ type: 'timestamp' })
  invoiceDate!: Date;

  @Column({ type: 'timestamp' })
  dueDate!: Date;

  @Column('decimal', { precision: 18, scale: 2 })
  totalAmount!: number;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  paidAmount!: number;

  @Column({ type: 'varchar', default: 'draft' })
  status!: string;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
