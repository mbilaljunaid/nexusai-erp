import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  firstName!: string;

  @Column({ type: 'varchar' })
  lastName!: string;

  @Column({ type: 'varchar' })
  email!: string;

  @Column({ type: 'varchar' })
  phone!: string;

  @Column({ type: 'varchar' })
  companyName!: string;

  @Column({ type: 'varchar' })
  industry!: string;

  @Column({ type: 'varchar', nullable: true })
  source?: string;

  @Column({ type: 'varchar', default: 'new' })
  status!: string;

  @Column('decimal', { precision: 18, scale: 2, nullable: true })
  estimatedValue?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
