import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  invoiceNumber!: string;

  @Column()
  customerId!: string;

  @Column()
  invoiceDate!: Date;

  @Column()
  dueDate!: Date;

  @Column('decimal', { precision: 18, scale: 2 })
  totalAmount!: number;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  paidAmount!: number;

  @Column({ default: 'draft' })
  status!: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
