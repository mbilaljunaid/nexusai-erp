"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertHzSurvivorshipRuleSchema = exports.insertHzMatchRuleSchema = exports.insertHzDupSetPartySchema = exports.insertHzDupSetSchema = exports.insertHzDupBatchSchema = exports.hzDupSetPartiesRelations = exports.hzDupSetsRelations = exports.hzDupBatchRelations = exports.hzSurvivorshipRules = exports.hzMatchRules = exports.hzDupSetParties = exports.hzDupSets = exports.hzDupBatch = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const drizzle_orm_2 = require("drizzle-orm");
const parties_1 = require("./parties");
// ==========================================
// 1. DUPLICATE BATCH (Run History)
// ==========================================
exports.hzDupBatch = (0, pg_core_1.pgTable)("hz_dup_batch", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    batchName: (0, pg_core_1.varchar)("batch_name").notNull(),
    status: (0, pg_core_1.varchar)("status").default("COMPLETED"), // RUNNING, COMPLETED, ERROR
    matchRuleCode: (0, pg_core_1.varchar)("match_rule_code"),
    totalRecordsProcessed: (0, pg_core_1.integer)("total_records_processed"),
    candidatesFound: (0, pg_core_1.integer)("candidates_found"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ==========================================
// 2. DUPLICATE SETS (Groups of potential dupes)
// ==========================================
exports.hzDupSets = (0, pg_core_1.pgTable)("hz_dup_sets", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    batchId: (0, pg_core_1.varchar)("batch_id").references(() => exports.hzDupBatch.id),
    status: (0, pg_core_1.varchar)("status").default("OPEN"), // OPEN, RESOLVED, MERGED, CLOSED
    assignedTo: (0, pg_core_1.varchar)("assigned_to"), // User ID of Data Steward
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ==========================================
// 3. DUPLICATE SET PARTIES (Links parties to sets)
// ==========================================
exports.hzDupSetParties = (0, pg_core_1.pgTable)("hz_dup_set_parties", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    setId: (0, pg_core_1.varchar)("set_id").references(() => exports.hzDupSets.id).notNull(),
    partyId: (0, pg_core_1.varchar)("party_id").references(() => parties_1.hzParties.id).notNull(),
    score: (0, pg_core_1.numeric)("score").notNull(), // 0-100 match score
    mergeStatus: (0, pg_core_1.varchar)("merge_status").default("CANDIDATE"), // CANDIDATE, MERGED_FROM, MERGED_TO, REJECTED
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ==========================================
// 4. MATCH RULES (Configuration)
// ==========================================
exports.hzMatchRules = (0, pg_core_1.pgTable)("hz_match_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ruleName: (0, pg_core_1.varchar)("rule_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    matchType: (0, pg_core_1.varchar)("match_type").default("FUZZY"), // EXACT, FUZZY
    matchScoreThreshold: (0, pg_core_1.integer)("match_score_threshold").default(80),
    configJson: (0, pg_core_1.json)("config_json"), // Stores columns, weights etc. e.g. { columns: ["partyName"] }
    activeFlag: (0, pg_core_1.boolean)("active_flag").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ==========================================
// 5. SURVIVORSHIP RULES (Confidence/Recency)
// ==========================================
exports.hzSurvivorshipRules = (0, pg_core_1.pgTable)("hz_survivorship_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ruleName: (0, pg_core_1.varchar)("rule_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    sourceSystem: (0, pg_core_1.varchar)("source_system"), // e.g. "CRM", "SAP"
    confidenceScore: (0, pg_core_1.integer)("confidence_score").default(50),
    logicType: (0, pg_core_1.varchar)("logic_type").default("SOURCE_CONFIDENCE"), // MOST_RECENT, SOURCE_CONFIDENCE
    activeFlag: (0, pg_core_1.boolean)("active_flag").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ==========================================
// RELATIONS
// ==========================================
exports.hzDupBatchRelations = (0, drizzle_orm_2.relations)(exports.hzDupBatch, ({ many }) => ({
    sets: many(exports.hzDupSets),
}));
exports.hzDupSetsRelations = (0, drizzle_orm_2.relations)(exports.hzDupSets, ({ one, many }) => ({
    batch: one(exports.hzDupBatch, {
        fields: [exports.hzDupSets.batchId],
        references: [exports.hzDupBatch.id],
    }),
    parties: many(exports.hzDupSetParties),
}));
exports.hzDupSetPartiesRelations = (0, drizzle_orm_2.relations)(exports.hzDupSetParties, ({ one }) => ({
    set: one(exports.hzDupSets, {
        fields: [exports.hzDupSetParties.setId],
        references: [exports.hzDupSets.id],
    }),
    party: one(parties_1.hzParties, {
        fields: [exports.hzDupSetParties.partyId],
        references: [parties_1.hzParties.id],
    }),
}));
// ==========================================
// Zod Schemas
// ==========================================
exports.insertHzDupBatchSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hzDupBatch).extend({
    batchName: zod_1.z.string().min(1),
});
exports.insertHzDupSetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hzDupSets).extend({
    batchId: zod_1.z.string().optional(),
});
exports.insertHzDupSetPartySchema = (0, drizzle_zod_1.createInsertSchema)(exports.hzDupSetParties).extend({
    score: zod_1.z.number().or(zod_1.z.string().transform(v => Number(v))),
});
exports.insertHzMatchRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hzMatchRules).extend({
    ruleName: zod_1.z.string().min(1),
    matchScoreThreshold: zod_1.z.number().min(0).max(100),
});
exports.insertHzSurvivorshipRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hzSurvivorshipRules).extend({
    ruleName: zod_1.z.string().min(1),
});
//# sourceMappingURL=data-quality.js.map