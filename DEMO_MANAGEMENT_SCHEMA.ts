// APPEND TO shared/schema.ts

// ========== DEMO MANAGEMENT SYSTEM ==========
export const demoEnvironments = pgTable("demo_environments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  industry: varchar("industry").notNull(),
  tenantId: varchar("tenant_id").notNull(),
  status: varchar("status").default("active"), // active, paused, expired
  expiresAt: timestamp("expires_at"),
  seedDataLoaded: boolean("seed_data_loaded").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const demoRequests = pgTable("demo_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  industry: varchar("industry").notNull(),
  company: varchar("company"),
  status: varchar("status").default("pending"), // pending, approved, demo_created, email_sent
  requestedAt: timestamp("requested_at").default(sql`now()`),
});

export const demoCredentials = pgTable("demo_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  demoEnvironmentId: varchar("demo_environment_id").notNull(),
  email: varchar("email").notNull(),
  username: varchar("username").notNull().unique(),
  password: varchar("password").notNull(), // encrypted
  demoLink: varchar("demo_link").notNull(),
  accessCount: integer("access_count").default(0),
  lastAccessAt: timestamp("last_access_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertDemoEnvironmentSchema = createInsertSchema(demoEnvironments).omit({ id: true, createdAt: true }).extend({
  industry: z.string().min(1),
  tenantId: z.string().min(1),
  status: z.string().optional(),
  expiresAt: z.date().optional().nullable(),
  seedDataLoaded: z.boolean().optional(),
});

export const insertDemoRequestSchema = createInsertSchema(demoRequests).omit({ id: true, requestedAt: true }).extend({
  email: z.string().email(),
  industry: z.string().min(1),
  company: z.string().optional().nullable(),
  status: z.string().optional(),
});

export const insertDemoCredentialSchema = createInsertSchema(demoCredentials).omit({ id: true, createdAt: true }).extend({
  demoEnvironmentId: z.string().min(1),
  email: z.string().email(),
  username: z.string().min(1),
  password: z.string().min(8),
  demoLink: z.string().min(1),
  accessCount: z.number().optional(),
  lastAccessAt: z.date().optional().nullable(),
});

export type InsertDemoEnvironment = z.infer<typeof insertDemoEnvironmentSchema>;
export type DemoEnvironment = typeof demoEnvironments.$inferSelect;
export type InsertDemoRequest = z.infer<typeof insertDemoRequestSchema>;
export type DemoRequest = typeof demoRequests.$inferSelect;
export type InsertDemoCredential = z.infer<typeof insertDemoCredentialSchema>;
export type DemoCredential = typeof demoCredentials.$inferSelect;
