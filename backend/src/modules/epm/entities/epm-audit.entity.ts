import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('epm_audit_logs')
export class EpmAudit {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    planUnitId!: string; // ID of the cell changed

    @Column('decimal', { precision: 20, scale: 2, nullable: true })
    oldValue!: number | null;

    @Column('decimal', { precision: 20, scale: 2, nullable: true })
    newValue!: number | null;

    @Column({ type: 'varchar', nullable: true })
    userId?: string; // Who made the change

    @Column({ type: 'varchar' })
    changeType!: string; // MANUAL, CALCULATION, WFP, ELIMINATION

    @CreateDateColumn()
    timestamp!: Date;
}
