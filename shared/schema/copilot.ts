import { pgTable, varchar, timestamp, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== AI COPILOT ==========
export const copilotConversations = pgTable("copilot_conversations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    title: varchar("title"),
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertCopilotConversationSchema = createInsertSchema(copilotConversations).omit({ id: true, createdAt: true, updatedAt: true }).extend({
    userId: z.string().min(1),
    title: z.string().optional(),
    status: z.string().optional(),
});

export type InsertCopilotConversation = z.infer<typeof insertCopilotConversationSchema>;
export type CopilotConversation = typeof copilotConversations.$inferSelect;

export const copilotMessages = pgTable("copilot_messages", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    conversationId: varchar("conversation_id").notNull(),
    role: varchar("role"), // user, assistant
    content: text("content").notNull(),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCopilotMessageSchema = createInsertSchema(copilotMessages).omit({ id: true, createdAt: true }).extend({
    conversationId: z.string().min(1),
    role: z.string().optional(),
    content: z.string().min(1),
});

export type InsertCopilotMessage = z.infer<typeof insertCopilotMessageSchema>;
export type CopilotMessage = typeof copilotMessages.$inferSelect;
