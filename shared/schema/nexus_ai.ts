import { pgTable, varchar, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== AI Provider Configuration ==========
// Stores which AI provider (OpenAI, Gemini, Claude, etc.) is active
// API keys are stored here (encrypted at rest by DB-level encryption)
export const aiProviderConfigs = pgTable("ai_provider_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  name: varchar("name").notNull(), // Display name e.g. "Production OpenAI"
  provider: varchar("provider").notNull(), // openai, google_gemini, anthropic, azure_openai, ollama, mistral, cohere, custom
  apiKey: text("api_key").notNull(), // Encrypted API key
  baseUrl: text("base_url"), // Custom endpoint URL
  model: varchar("model").notNull(), // e.g. gpt-4o, gemini-2.5-pro
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  maxTokens: integer("max_tokens").default(4096),
  temperature: integer("temperature").default(7), // stored as 0-20 (divided by 10 for 0.0-2.0)
  settings: jsonb("settings"), // Additional provider-specific settings
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertAiProviderConfigSchema = createInsertSchema(aiProviderConfigs).extend({
  name: z.string().min(1),
  provider: z.string().min(1),
  apiKey: z.string().min(1),
  model: z.string().min(1),
  baseUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  maxTokens: z.number().optional(),
  temperature: z.number().optional(),
  settings: z.record(z.any()).optional(),
});

export type AiProviderConfig = typeof aiProviderConfigs.$inferSelect;
export type InsertAiProviderConfig = z.infer<typeof insertAiProviderConfigSchema>;

// ========== NexusAI Conversation History ==========
export const nexusConversations = pgTable("nexus_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  tenantId: varchar("tenant_id"),
  title: varchar("title"),
  moduleContext: varchar("module_context"), // Which module the conversation started in
  messages: jsonb("messages").$type<Array<{
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
    toolCalls?: any[];
  }>>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertNexusConversationSchema = createInsertSchema(nexusConversations).extend({
  userId: z.string().min(1),
  title: z.string().optional(),
  moduleContext: z.string().optional(),
  messages: z.array(z.any()).optional(),
});

export type NexusConversation = typeof nexusConversations.$inferSelect;
export type InsertNexusConversation = z.infer<typeof insertNexusConversationSchema>;
