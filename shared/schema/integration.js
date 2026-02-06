"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertEtlPipelineSchema = exports.etlPipelines = exports.insertDataLakeSchema = exports.dataLakes = exports.insertWebhookEventSchema = exports.webhookEvents = exports.insertConnectorInstanceSchema = exports.connectorInstances = exports.insertConnectorSchema = exports.connectors = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== CONNECTORS & INTEGRATIONS ==========
exports.connectors = (0, pg_core_1.pgTable)("connectors", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    type: (0, pg_core_1.varchar)("type").notNull(), // api, database, webhook, file
    config: (0, pg_core_1.jsonb)("config"),
    status: (0, pg_core_1.varchar)("status").default("active"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertConnectorSchema = (0, drizzle_zod_1.createInsertSchema)(exports.connectors).extend({
    name: zod_1.z.string().min(1),
    type: zod_1.z.string().min(1),
    config: zod_1.z.record(zod_1.z.any()).optional(),
    status: zod_1.z.string().optional(),
});
exports.connectorInstances = (0, pg_core_1.pgTable)("connector_instances", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    connectorId: (0, pg_core_1.varchar)("connector_id").notNull(),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    config: (0, pg_core_1.jsonb)("config"),
    credentials: (0, pg_core_1.jsonb)("credentials"),
    status: (0, pg_core_1.varchar)("status").default("active"),
    lastSyncAt: (0, pg_core_1.timestamp)("last_sync_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertConnectorInstanceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.connectorInstances).extend({
    connectorId: zod_1.z.string().min(1),
    tenantId: zod_1.z.string().min(1),
    config: zod_1.z.record(zod_1.z.any()).optional(),
    credentials: zod_1.z.record(zod_1.z.any()).optional(),
    status: zod_1.z.string().optional(),
    lastSyncAt: zod_1.z.date().optional().nullable(),
});
exports.webhookEvents = (0, pg_core_1.pgTable)("webhook_events", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    connectorInstanceId: (0, pg_core_1.varchar)("connector_instance_id").notNull(),
    eventType: (0, pg_core_1.varchar)("event_type").notNull(),
    payload: (0, pg_core_1.jsonb)("payload"),
    status: (0, pg_core_1.varchar)("status").default("pending"), // pending, processed, failed
    processedAt: (0, pg_core_1.timestamp)("processed_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertWebhookEventSchema = (0, drizzle_zod_1.createInsertSchema)(exports.webhookEvents).extend({
    connectorInstanceId: zod_1.z.string().min(1),
    eventType: zod_1.z.string().min(1),
    payload: zod_1.z.record(zod_1.z.any()).optional(),
    status: zod_1.z.string().optional(),
    processedAt: zod_1.z.date().optional().nullable(),
});
// ========== DATA LAKE & ETL ==========
exports.dataLakes = (0, pg_core_1.pgTable)("data_lakes", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    storageType: (0, pg_core_1.varchar)("storage_type"), // s3, gcs, azure, local
    connectionConfig: (0, pg_core_1.jsonb)("connection_config"),
    status: (0, pg_core_1.varchar)("status").default("active"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertDataLakeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dataLakes).extend({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    storageType: zod_1.z.string().optional(),
    connectionConfig: zod_1.z.record(zod_1.z.any()).optional(),
    status: zod_1.z.string().optional(),
});
exports.etlPipelines = (0, pg_core_1.pgTable)("etl_pipelines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    sourceConfig: (0, pg_core_1.jsonb)("source_config"),
    transformConfig: (0, pg_core_1.jsonb)("transform_config"),
    destinationConfig: (0, pg_core_1.jsonb)("destination_config"),
    schedule: (0, pg_core_1.varchar)("schedule"), // cron expression
    status: (0, pg_core_1.varchar)("status").default("active"),
    lastRunAt: (0, pg_core_1.timestamp)("last_run_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertEtlPipelineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.etlPipelines).extend({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    sourceConfig: zod_1.z.record(zod_1.z.any()).optional(),
    transformConfig: zod_1.z.record(zod_1.z.any()).optional(),
    destinationConfig: zod_1.z.record(zod_1.z.any()).optional(),
    schedule: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    lastRunAt: zod_1.z.date().optional().nullable(),
});
//# sourceMappingURL=integration.js.map