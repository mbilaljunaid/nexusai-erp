import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  companyName: string;

  @Column()
  industry: string;

  @Column({ nullable: true })
  source: string;

  @Column({ default: 'new' })
  status: string;

  @Column('decimal', { precision: 18, scale: 2, nullable: true })
  estimatedValue: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
