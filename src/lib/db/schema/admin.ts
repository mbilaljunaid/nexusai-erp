import { pgTable, uuid, varchar, text, boolean, integer, decimal, timestamp, jsonb, inet } from 'drizzle-orm/pg-core';
import { tenants } from './core';
import { users } from './auth';

// Demo Environments
export const demoEnvironments = pgTable('demo_environments', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    industry: varchar('industry', { length: 100 }),
    status: varchar('status', { length: 20 }).default('provisioning'),
    accessUrl: text('access_url'),
    credentials: jsonb('credentials'),
    modules: jsonb('modules').default([]),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Tenant Module Subscriptions
export const tenantModules = pgTable('tenant_modules', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: varchar('tenant_id', { length: 255 }).references(() => tenants.id, { onDelete: 'cascade' }),
    moduleId: varchar('module_id', { length: 255 }),
    enabled: boolean('enabled').default(true),
    enabledAt: timestamp('enabled_at').defaultNow(),
    disabledAt: timestamp('disabled_at'),
    configuration: jsonb('configuration').default({}),
});

// Support Requests
export const supportRequests = pgTable('support_requests', {
    id: uuid('id').primaryKey().defaultRandom(),
    type: varchar('type', { length: 50 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 20 }).default('open'),
    priority: varchar('priority', { length: 20 }).default('medium'),
    submittedBy: varchar('submitted_by', { length: 255 }),
    tenantId: varchar('tenant_id', { length: 255 }).references(() => tenants.id),
    assignedTo: varchar('assigned_to', { length: 255 }).references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Marketing Campaigns
export const marketingCampaigns = pgTable('marketing_campaigns', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }),
    status: varchar('status', { length: 20 }).default('draft'),
    leadsGenerated: integer('leads_generated').default(0),
    conversionRate: decimal('conversion_rate', { precision: 5, scale: 2 }),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Blog Posts
export const blogPosts = pgTable('blog_posts', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    content: text('content'),
    authorId: varchar('author_id', { length: 255 }).references(() => users.id),
    status: varchar('status', { length: 20 }).default('draft'),
    views: integer('views').default(0),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Email Campaigns
export const emailCampaigns = pgTable('email_campaigns', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    status: varchar('status', { length: 20 }).default('draft'),
    sentCount: integer('sent_count').default(0),
    openedCount: integer('opened_count').default(0),
    clickedCount: integer('clicked_count').default(0),
    templateId: uuid('template_id'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Email Templates
export const emailTemplates = pgTable('email_templates', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    category: varchar('category', { length: 100 }),
    subject: varchar('subject', { length: 255 }),
    htmlContent: text('html_content'),
    textContent: text('text_content'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Affiliates
export const affiliates = pgTable('affiliates', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    status: varchar('status', { length: 20 }).default('pending'),
    referralCode: varchar('referral_code', { length: 50 }).notNull().unique(),
    tier: varchar('tier', { length: 20 }).default('bronze'),
    commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }),
    totalReferrals: integer('total_referrals').default(0),
    totalConversions: integer('total_conversions').default(0),
    totalCommission: decimal('total_commission', { precision: 10, scale: 2 }).default('0'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Affiliate Referrals
export const affiliateReferrals = pgTable('affiliate_referrals', {
    id: uuid('id').primaryKey().defaultRandom(),
    affiliateId: uuid('affiliate_id').references(() => affiliates.id, { onDelete: 'cascade' }),
    tenantId: varchar('tenant_id', { length: 255 }).references(() => tenants.id),
    converted: boolean('converted').default(false),
    commissionAmount: decimal('commission_amount', { precision: 10, scale: 2 }),
    createdAt: timestamp('created_at').defaultNow(),
});

// Database Backups
export const databaseBackups = pgTable('database_backups', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 20 }).default('automatic'),
    status: varchar('status', { length: 20 }).default('in_progress'),
    sizeBytes: integer('size_bytes'),
    storageLocation: text('storage_location'),
    durationSeconds: integer('duration_seconds'),
    createdAt: timestamp('created_at').defaultNow(),
    completedAt: timestamp('completed_at'),
});

// System Configuration
export const systemConfig = pgTable('system_config', {
    id: uuid('id').primaryKey().defaultRandom(),
    key: varchar('key', { length: 100 }).notNull().unique(),
    value: jsonb('value'),
    category: varchar('category', { length: 50 }),
    description: text('description'),
    updatedBy: varchar('updated_by', { length: 255 }).references(() => users.id),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Feature Flags
export const featureFlags = pgTable('feature_flags', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    enabled: boolean('enabled').default(false),
    description: text('description'),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Admin Audit Logs
export const adminAuditLogs = pgTable('admin_audit_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    actorId: varchar('actor_id', { length: 255 }).references(() => users.id),
    actorEmail: varchar('actor_email', { length: 255 }),
    action: varchar('action', { length: 100 }).notNull(),
    resourceType: varchar('resource_type', { length: 50 }),
    resourceId: uuid('resource_id'),
    resourceName: varchar('resource_name', { length: 255 }),
    details: jsonb('details'),
    ipAddress: inet('ip_address'),
    createdAt: timestamp('created_at').defaultNow(),
});
