import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('leads')
export class Lead {
  @PrimaryColumn({ type: 'varchar', default: () => 'gen_random_uuid()' })
  id!: string;

  @Column({ name: 'first_name', type: 'varchar', nullable: true })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', nullable: true })
  lastName!: string;

  @Column({ type: 'varchar', nullable: true })
  email!: string;

  @Column({ type: 'varchar', nullable: true })
  phone!: string;

  @Column({ name: 'company', type: 'varchar', nullable: true })
  companyName!: string;

  @Column({ type: 'varchar', nullable: true })
  industry!: string;

  @Column({ name: 'lead_source', type: 'varchar', nullable: true })
  source?: string;

  @Column({ type: 'varchar', default: 'new', nullable: true })
  status!: string;

  @Column('decimal', { precision: 18, scale: 2, nullable: true })
  estimatedValue?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
