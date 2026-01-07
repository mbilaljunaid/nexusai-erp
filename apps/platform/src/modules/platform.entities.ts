import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'tenants', schema: 'common' })
export class TenantEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ name: 'subscription_plan', default: 'FREE' })
    subscriptionPlan: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

@Entity({ name: 'users', schema: 'common' })
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'tenant_id' })
    tenantId: string;

    @Column({ unique: true })
    email: string;

    @Column({ name: 'password_hash', select: false })
    passwordHash: string;

    @Column({ name: 'full_name' })
    fullName: string;

    @Column({ default: 'VIEWER' })
    role: string; // 'ADMIN', 'MANAGER', 'VIEWER'

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

@Entity({ name: 'audit_logs', schema: 'common' })
export class AuditLogEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'tenant_id' })
    tenantId: string;

    @Column('uuid', { name: 'user_id' })
    userId: string;

    @Column()
    action: string;

    @Column()
    resource: string;

    @Column('jsonb', { nullable: true })
    details: any;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
