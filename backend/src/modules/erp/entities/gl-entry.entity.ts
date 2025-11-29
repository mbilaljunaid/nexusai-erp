import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('gl_entries')
export class GLEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  journalDate: Date;

  @Column()
  description: string;

  @Column()
  debitAccount: string;

  @Column('decimal', { precision: 18, scale: 2 })
  debitAmount: number;

  @Column()
  creditAccount: string;

  @Column('decimal', { precision: 18, scale: 2 })
  creditAmount: number;

  @Column({ default: 'draft' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
