import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('gl_entries')
export class GLEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'timestamp' })
  journalDate!: Date;

  @Column({ type: 'varchar' })
  description!: string;

  @Column({ type: 'varchar' })
  debitAccount!: string;

  @Column('decimal', { precision: 18, scale: 2 })
  debitAmount!: number;

  @Column({ type: 'varchar' })
  creditAccount!: string;

  @Column('decimal', { precision: 18, scale: 2 })
  creditAmount!: number;

  @Column({ type: 'varchar', default: 'draft' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
