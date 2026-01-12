import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RequisitionLine } from './requisition-line.entity';

@Entity('procure_requisition_headers')
export class RequisitionHeader {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    reqNumber!: string;

    @Column({ nullable: true })
    description?: string;

    @Column()
    requesterId!: string;

    @Column({ default: 'Draft' })
    status!: string;

    @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
    totalAmount!: number;

    @Column({ nullable: true })
    justification?: string;

    @Column({ nullable: true })
    currentApproverId?: string;

    @OneToMany(() => RequisitionLine, (line) => line.header, { cascade: true })
    lines!: RequisitionLine[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
