import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('projects2')
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ default: 'active' })
    status!: string;

    @Column({ name: 'start_date', nullable: true })
    startDate?: Date;

    @Column({ name: 'end_date', nullable: true })
    endDate?: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}
