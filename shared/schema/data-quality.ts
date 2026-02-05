
import { pgTable, varchar, text, timestamp, integer, numeric, date, boolean, json } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { hzParties } from "./parties";


// ==========================================
// 1. DUPLICATE BATCH (Run History)
// ==========================================
export const hzDupBatch = pgTable("hz_dup_batch", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    batchName: varchar("batch_name").notNull(),
    status: varchar("status").default("COMPLETED"), // RUNNING, COMPLETED, ERROR
    matchRuleCode: varchar("match_rule_code"),
    totalRecordsProcessed: integer("total_records_processed"),
    candidatesFound: integer("candidates_found"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// ==========================================
// 2. DUPLICATE SETS (Groups of potential dupes)
// ==========================================
export const hzDupSets = pgTable("hz_dup_sets", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    batchId: varchar("batch_id").references(() => hzDupBatch.id),
    status: varchar("status").default("OPEN"), // OPEN, RESOLVED, MERGED, CLOSED
    assignedTo: varchar("assigned_to"), // User ID of Data Steward
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// ==========================================
// 3. DUPLICATE SET PARTIES (Links parties to sets)
// ==========================================
export const hzDupSetParties = pgTable("hz_dup_set_parties", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    setId: varchar("set_id").references(() => hzDupSets.id).notNull(),
    partyId: varchar("party_id").references(() => hzParties.id).notNull(),

    score: numeric("score").notNull(), // 0-100 match score
    mergeStatus: varchar("merge_status").default("CANDIDATE"), // CANDIDATE, MERGED_FROM, MERGED_TO, REJECTED

    createdAt: timestamp("created_at").default(sql`now()`),
});

// ==========================================
// 4. MATCH RULES (Configuration)
// ==========================================
export const hzMatchRules = pgTable("hz_match_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ruleName: varchar("rule_name").notNull(),
    description: text("description"),
    matchType: varchar("match_type").default("FUZZY"), // EXACT, FUZZY
    matchScoreThreshold: integer("match_score_threshold").default(80),
    configJson: json("config_json"), // Stores columns, weights etc. e.g. { columns: ["partyName"] }
    activeFlag: boolean("active_flag").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// ==========================================
// 5. SURVIVORSHIP RULES (Confidence/Recency)
// ==========================================
export const hzSurvivorshipRules = pgTable("hz_survivorship_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ruleName: varchar("rule_name").notNull(),
    description: text("description"),
    sourceSystem: varchar("source_system"), // e.g. "CRM", "SAP"
    confidenceScore: integer("confidence_score").default(50),
    logicType: varchar("logic_type").default("SOURCE_CONFIDENCE"), // MOST_RECENT, SOURCE_CONFIDENCE
    activeFlag: boolean("active_flag").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// ==========================================
// RELATIONS
// ==========================================
export const hzDupBatchRelations = relations(hzDupBatch, ({ many }) => ({
    sets: many(hzDupSets),
}));

export const hzDupSetsRelations = relations(hzDupSets, ({ one, many }) => ({
    batch: one(hzDupBatch, {
        fields: [hzDupSets.batchId],
        references: [hzDupBatch.id],
    }),
    parties: many(hzDupSetParties),
}));

export const hzDupSetPartiesRelations = relations(hzDupSetParties, ({ one }) => ({
    set: one(hzDupSets, {
        fields: [hzDupSetParties.setId],
        references: [hzDupSets.id],
    }),
    party: one(hzParties, {
        fields: [hzDupSetParties.partyId],
        references: [hzParties.id],
    }),
}));


// ==========================================
// Zod Schemas
// ==========================================
export const insertHzDupBatchSchema = createInsertSchema(hzDupBatch).extend({
    batchName: z.string().min(1),
});

export const insertHzDupSetSchema = createInsertSchema(hzDupSets).extend({
    batchId: z.string().optional(),
});

export const insertHzDupSetPartySchema = createInsertSchema(hzDupSetParties).extend({
    score: z.number().or(z.string().transform(v => Number(v))),
});

export const insertHzMatchRuleSchema = createInsertSchema(hzMatchRules).extend({
    ruleName: z.string().min(1),
    matchScoreThreshold: z.number().min(0).max(100),
});

export const insertHzSurvivorshipRuleSchema = createInsertSchema(hzSurvivorshipRules).extend({
    ruleName: z.string().min(1),
});


// Types
export type HzDupBatch = typeof hzDupBatch.$inferSelect;
export type InsertHzDupBatch = typeof hzDupBatch.$inferInsert;

export type HzDupSet = typeof hzDupSets.$inferSelect;
export type InsertHzDupSet = typeof hzDupSets.$inferInsert;

export type HzDupSetParty = typeof hzDupSetParties.$inferSelect;
export type InsertHzDupSetParty = typeof hzDupSetParties.$inferInsert;

export type HzMatchRule = typeof hzMatchRules.$inferSelect;
export type InsertHzMatchRule = typeof hzMatchRules.$inferInsert;

export type HzSurvivorshipRule = typeof hzSurvivorshipRules.$inferSelect;
export type InsertHzSurvivorshipRule = typeof hzSurvivorshipRules.$inferInsert;
