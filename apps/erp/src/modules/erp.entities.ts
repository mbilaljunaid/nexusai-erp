import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

// CRM
@Entity({ name: 'leads', schema: 'erp_crm' })
export class LeadEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'tenant_id' })
    tenantId: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    status: string; // 'NEW', 'QUALIFIED', 'LOST'

    @Column('decimal', { default: 0 })
    potentialValue: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

// HR
@Entity({ name: 'employees', schema: 'erp_hr' })
export class EmployeeEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'tenant_id' })
    tenantId: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    department: string;

    @Column()
    status: string; // 'ACTIVE', 'ON_LEAVE', 'TERMINATED'

    @Column({ type: 'date' })
    joinDate: string;
}

// Finance
@Entity({ name: 'invoices', schema: 'erp_finance' })
export class InvoiceEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'tenant_id' })
    tenantId: string;

    @Column()
    customerName: string;

    @Column('decimal')
    amount: number;

    @Column()
    status: string; // 'DRAFT', 'SENT', 'PAID', 'OVERDUE'

    @Column({ type: 'date' })
    dueDate: string;
}

// Inventory
@Entity({ name: 'items', schema: 'erp_inventory' })
export class ItemEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'tenant_id' })
    tenantId: string;

    @Column()
    name: string;

    @Column()
    sku: string; // Stock Keeping Unit

    @Column('decimal', { default: 0 })
    cost: number;

    @Column('decimal', { default: 0 })
    price: number;

    @Column({ default: 0 })
    stockLevel: number;
}

// Procurement
@Entity({ name: 'suppliers', schema: 'erp_procurement' })
export class SupplierEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'tenant_id' })
    tenantId: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @Column({ default: 'ACTIVE' })
    status: string;
}

@Entity({ name: 'purchase_orders', schema: 'erp_procurement' })
export class PurchaseOrderEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'tenant_id' })
    tenantId: string;

    @Column('uuid', { name: 'supplier_id' })
    supplierId: string;

    @Column('decimal')
    totalAmount: number;

    @Column({ default: 'DRAFT' })
    status: string; // DRAFT, SENT, RECEIVED, CLOSED

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

// Projects
@Entity({ name: 'projects', schema: 'erp_projects' })
export class ProjectEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'tenant_id' })
    tenantId: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ default: 'PLANNED' })
    status: string; // PLANNED, ACTIVE, COMPLETED, ON_HOLD

    @Column({ type: 'date' })
    startDate: string;

    @Column({ type: 'date' })
    endDate: string;
}

@Entity({ name: 'tasks', schema: 'erp_projects' })
export class TaskEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'tenant_id' })
    tenantId: string;

    @Column('uuid', { name: 'project_id' })
    projectId: string;

    @Column()
    title: string;

    @Column({ default: 'TODO' })
    status: string; // TODO, IN_PROGRESS, REVIEW, DONE

    @Column('uuid', { name: 'assigned_to', nullable: true })
    assignedTo: string; // Employee ID
}
