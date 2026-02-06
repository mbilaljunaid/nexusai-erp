"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertCopilotMessageSchema = exports.copilotMessages = exports.insertCopilotConversationSchema = exports.copilotConversations = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== AI COPILOT ==========
exports.copilotConversations = (0, pg_core_1.pgTable)("copilot_conversations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    title: (0, pg_core_1.varchar)("title"),
    status: (0, pg_core_1.varchar)("status").default("active"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertCopilotConversationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.copilotConversations).extend({
    userId: zod_1.z.string().min(1),
    title: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
});
exports.copilotMessages = (0, pg_core_1.pgTable)("copilot_messages", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    conversationId: (0, pg_core_1.varchar)("conversation_id").notNull(),
    role: (0, pg_core_1.varchar)("role"), // user, assistant
    content: (0, pg_core_1.text)("content").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertCopilotMessageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.copilotMessages).extend({
    conversationId: zod_1.z.string().min(1),
    role: zod_1.z.string().optional(),
    content: zod_1.z.string().min(1),
});
//# sourceMappingURL=copilot.js.map