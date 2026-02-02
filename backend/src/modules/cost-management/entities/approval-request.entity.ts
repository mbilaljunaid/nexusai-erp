import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ApprovalStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

@Entity('cst_approval_requests')
export class ApprovalRequest {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    requesterId!: string; // ID of the user requesting the action

    @Column({ type: 'varchar', nullable: true })
    approverId!: string; // ID of the user who approved/rejected

    @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING })
    status!: ApprovalStatus;

    @Column({ type: 'varchar' })
    entityType!: string; // e.g., 'COST_SCENARIO', 'COST_ADJUSTMENT'

    @Column({ type: 'varchar' })
    entityId!: string; // ID of the entity being approved

    @Column({ type: 'text', nullable: true })
    payload!: string; // JSON payload for the action (optional)

    @Column({ type: 'text', nullable: true })
    rejectionReason!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
