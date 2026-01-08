import { pgTable, varchar, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== CONNECTORS & INTEGRATIONS ==========
export const connectors = pgTable("connectors", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    type: varchar("type").notNull(), // api, database, webhook, file
    config: jsonb("config"),
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertConnectorSchema = createInsertSchema(connectors).extend({
    name: z.string().min(1),
    type: z.string().min(1),
    config: z.record(z.any()).optional(),
    status: z.string().optional(),
});

export type InsertConnector = z.infer<typeof insertConnectorSchema>;
export type Connector = typeof connectors.$inferSelect;

export const connectorInstances = pgTable("connector_instances", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    connectorId: varchar("connector_id").notNull(),
    tenantId: varchar("tenant_id").notNull(),
    config: jsonb("config"),
    credentials: jsonb("credentials"),
    status: varchar("status").default("active"),
    lastSyncAt: timestamp("last_sync_at"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertConnectorInstanceSchema = createInsertSchema(connectorInstances).extend({
    connectorId: z.string().min(1),
    tenantId: z.string().min(1),
    config: z.record(z.any()).optional(),
    credentials: z.record(z.any()).optional(),
    status: z.string().optional(),
    lastSyncAt: z.date().optional().nullable(),
});

export type InsertConnectorInstance = z.infer<typeof insertConnectorInstanceSchema>;
export type ConnectorInstance = typeof connectorInstances.$inferSelect;

export const webhookEvents = pgTable("webhook_events", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    connectorInstanceId: varchar("connector_instance_id").notNull(),
    eventType: varchar("event_type").notNull(),
    payload: jsonb("payload"),
    status: varchar("status").default("pending"), // pending, processed, failed
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertWebhookEventSchema = createInsertSchema(webhookEvents).extend({
    connectorInstanceId: z.string().min(1),
    eventType: z.string().min(1),
    payload: z.record(z.any()).optional(),
    status: z.string().optional(),
    processedAt: z.date().optional().nullable(),
});

export type InsertWebhookEvent = z.infer<typeof insertWebhookEventSchema>;
export type WebhookEvent = typeof webhookEvents.$inferSelect;

// ========== DATA LAKE & ETL ==========
export const dataLakes = pgTable("data_lakes", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    storageType: varchar("storage_type"), // s3, gcs, azure, local
    connectionConfig: jsonb("connection_config"),
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertDataLakeSchema = createInsertSchema(dataLakes).extend({
    name: z.string().min(1),
    description: z.string().optional(),
    storageType: z.string().optional(),
    connectionConfig: z.record(z.any()).optional(),
    status: z.string().optional(),
});

export type InsertDataLake = z.infer<typeof insertDataLakeSchema>;
export type DataLake = typeof dataLakes.$inferSelect;

export const etlPipelines = pgTable("etl_pipelines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    sourceConfig: jsonb("source_config"),
    transformConfig: jsonb("transform_config"),
    destinationConfig: jsonb("destination_config"),
    schedule: varchar("schedule"), // cron expression
    status: varchar("status").default("active"),
    lastRunAt: timestamp("last_run_at"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertEtlPipelineSchema = createInsertSchema(etlPipelines).extend({
    name: z.string().min(1),
    description: z.string().optional(),
    sourceConfig: z.record(z.any()).optional(),
    transformConfig: z.record(z.any()).optional(),
    destinationConfig: z.record(z.any()).optional(),
    schedule: z.string().optional(),
    status: z.string().optional(),
    lastRunAt: z.date().optional().nullable(),
});

export type InsertEtlPipeline = z.infer<typeof insertEtlPipelineSchema>;
export type EtlPipeline = typeof etlPipelines.$inferSelect;
