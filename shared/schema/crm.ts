import { pgTable, text, serial, integer, boolean, timestamp, jsonb, numeric, varchar, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== CRM MODULE ==========

// --- Leads ---
export const leads = pgTable("leads", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    // Core Info
    salutation: varchar("salutation"), // Mr. Ms. Dr.
    firstName: varchar("first_name"),
    lastName: varchar("last_name").notNull(),
    name: varchar("name").notNull(), // Full name (computed or entered)
    title: varchar("title"),
    company: varchar("company"),

    // Contact Info
    email: varchar("email"),
    phone: varchar("phone"),
    mobilePhone: varchar("mobile_phone"),
    website: varchar("website"),

    // Address Info
    street: text("street"),
    city: varchar("city"),
    state: varchar("state"),
    postalCode: varchar("postal_code"),
    country: varchar("country"),

    // Qualification
    leadSource: varchar("lead_source"),
    status: varchar("status").default("new"), // new, working, nurturing, converted, unqualified
    industry: varchar("industry"),
    rating: varchar("rating"), // Hot, Warm, Cold
    annualRevenue: numeric("annual_revenue"),
    numberOfEmployees: integer("number_of_employees"),

    // System/Scoring
    score: numeric("score", { precision: 5, scale: 2 }).default("0"),
    isConverted: integer("is_converted").default(0), // Boolean 0/1
    convertedDate: timestamp("converted_date"),
    convertedAccountId: varchar("converted_account_id"),
    convertedContactId: varchar("converted_contact_id"),
    convertedOpportunityId: varchar("converted_opportunity_id"),

    description: text("description"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
    ownerId: varchar("owner_id"),
});

export const insertLeadSchema = createInsertSchema(leads).extend({
    lastName: z.string().min(1, "Last Name is required"),
    name: z.string().min(1, "Full Name is required"),
    email: z.string().email().optional().nullable().or(z.literal("")),
    annualRevenue: z.number().or(z.string().transform(v => Number(v))).optional().nullable(),
});

// --- Accounts (Companies) ---
export const accounts = pgTable("accounts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    parentAccountId: varchar("parent_account_id"),
    type: varchar("type"), // Prospect, Customer - Direct, Channel Partner, etc.
    industry: varchar("industry"),
    rating: varchar("rating"),

    // Billing Address
    billingStreet: text("billing_street"),
    billingCity: varchar("billing_city"),
    billingState: varchar("billing_state"),
    billingPostalCode: varchar("billing_postal_code"),
    billingCountry: varchar("billing_country"),

    // Shipping Address
    shippingStreet: text("shipping_street"),
    shippingCity: varchar("shipping_city"),
    shippingState: varchar("shipping_state"),
    shippingPostalCode: varchar("shipping_postal_code"),
    shippingCountry: varchar("shipping_country"),

    phone: varchar("phone"),
    fax: varchar("fax"),
    website: varchar("website"),

    annualRevenue: numeric("annual_revenue"),
    numberOfEmployees: integer("number_of_employees"),
    ownership: varchar("ownership"), // Public, Private, Subsidiary
    tickerSymbol: varchar("ticker_symbol"),

    description: text("description"),
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
    ownerId: varchar("owner_id"),
});

export const insertAccountSchema = createInsertSchema(accounts).extend({
    name: z.string().min(1, "Account name is required"),
    annualRevenue: z.number().or(z.string().transform(v => Number(v))).optional().nullable(),
});

// --- Contacts (People) ---
export const contacts = pgTable("contacts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    accountId: varchar("account_id"), // FK to accounts
    salutation: varchar("salutation"),
    firstName: varchar("first_name").notNull(),
    lastName: varchar("last_name").notNull(),

    email: varchar("email"),
    phone: varchar("phone"),
    mobilePhone: varchar("mobile_phone"),
    homePhone: varchar("home_phone"),

    title: varchar("title"),
    department: varchar("department"),
    assistantName: varchar("assistant_name"),
    assistantPhone: varchar("assistant_phone"),
    leadSource: varchar("lead_source"),

    // Mailing Address
    mailingStreet: text("mailing_street"),
    mailingCity: varchar("mailing_city"),
    mailingState: varchar("mailing_state"),
    mailingPostalCode: varchar("mailing_postal_code"),
    mailingCountry: varchar("mailing_country"),

    description: text("description"),
    birthdate: timestamp("birthdate"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
    ownerId: varchar("owner_id"),
});

export const insertContactSchema = createInsertSchema(contacts).extend({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email().optional().nullable().or(z.literal("")),
});

// --- Campaigns ---
export const campaigns = pgTable("campaigns", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    type: varchar("type"), // Conference, Webinar, Email, etc.
    status: varchar("status").default("Planned"), // Planned, In Progress, Completed, Aborted
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    expectedRevenue: numeric("expected_revenue"),
    budgetedCost: numeric("budgeted_cost"),
    actualCost: numeric("actual_cost"),
    isActive: integer("is_active").default(1),
    description: text("description"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
    ownerId: varchar("owner_id"),
});

export const insertCampaignSchema = createInsertSchema(campaigns).extend({
    name: z.string().min(1, "Campaign name is required"),
    startDate: z.coerce.date().optional().nullable(),
    endDate: z.coerce.date().optional().nullable(),
    expectedRevenue: z.number().or(z.string().transform(v => Number(v))).optional().nullable(),
    budgetedCost: z.number().or(z.string().transform(v => Number(v))).optional().nullable(),
    actualCost: z.number().or(z.string().transform(v => Number(v))).optional().nullable(),
});

// --- Opportunities (Deals) ---
export const opportunities = pgTable("opportunities", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    accountId: varchar("account_id"),
    type: varchar("type"), // New Business, existing business, etc.
    leadSource: varchar("lead_source"),

    amount: numeric("amount").notNull(),
    closeDate: timestamp("close_date"),
    stage: varchar("stage").notNull(),
    nextStep: varchar("next_step"),

    probability: integer("probability"), // 0-100
    forecastCategory: varchar("forecast_category"), // Pipeline, Best Case, Commit, Closed

    description: text("description"),
    contactId: varchar("contact_id"),
    campaignId: varchar("campaign_id"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
    ownerId: varchar("owner_id"),
});

export const insertOpportunitySchema = createInsertSchema(opportunities).extend({
    name: z.string().min(1, "Opportunity name is required"),
    amount: z.number().or(z.string().transform(v => Number(v))).optional().nullable().default(0),
    probability: z.number().or(z.string().transform(v => Number(v))).optional().nullable(),
    closeDate: z.coerce.date().optional().nullable(),
});

// --- Interactions (Activities) ---
export const interactions = pgTable("interactions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    entityType: varchar("entity_type").notNull(), // lead, contact, account, opportunity
    entityId: varchar("entity_id").notNull(),
    type: varchar("type").notNull(), // call, email, meeting, note
    subject: varchar("subject"),
    summary: text("summary").notNull(), // Keep for backward compat or use as 'description'
    description: text("description"),
    priority: varchar("priority").default("Normal"),
    status: varchar("status").default("Completed"), // Not Started, In Progress, Completed

    dueDate: timestamp("due_date"),
    performedAt: timestamp("performed_at").default(sql`now()`),
    performedBy: varchar("performed_by"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertInteractionSchema = createInsertSchema(interactions).extend({
    summary: z.string().min(1, "Summary/Subject is required"),
    type: z.enum(["call", "email", "meeting", "note", "task"]),
    dueDate: z.coerce.date().optional().nullable(),
    performedAt: z.coerce.date().optional().nullable(),
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Opportunity = typeof opportunities.$inferSelect;


// --- Products & CPQ ---

export const products = pgTable("crm_products", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    productCode: varchar("product_code"),
    description: text("description"),
    isActive: integer("is_active").default(1), // 1=Active, 0=Inactive
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const priceBooks = pgTable("crm_price_books", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    isActive: integer("is_active").default(1),
    isStandard: integer("is_standard").default(0),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const priceBookEntries = pgTable("crm_price_book_entries", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    priceBookId: varchar("price_book_id").notNull(),
    productId: varchar("product_id").notNull(),
    unitPrice: numeric("unit_price").notNull(),
    isActive: integer("is_active").default(1),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const opportunityLineItems = pgTable('crm_opportunity_line_items', {
    id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
    opportunityId: varchar('opportunity_id').references(() => opportunities.id).notNull(),
    productId: uuid('product_id').references(() => products.id), // Can be nullable if custom item
    priceBookEntryId: uuid('price_book_entry_id'), // Kept for legacy compatibility
    quantity: integer('quantity').notNull().default(1),
    unitPrice: numeric('unit_price').notNull(),
    totalPrice: numeric('total_price'), // Computed
    description: text('description'),
    createdAt: timestamp('created_at').default(sql`now()`),
});

// Quotes
export const quotes = pgTable('crm_quotes', {
    id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
    opportunityId: varchar('opportunity_id').references(() => opportunities.id), // Can be standalone
    name: text('name').notNull(),
    quoteNumber: text('quote_number'), // Auto-gen preferred
    expirationDate: timestamp('expiration_date'),
    status: text('status').default('Draft'), // Draft, Presented, Accepted, Rejected
    totalAmount: numeric('total_amount').default('0'),
    description: text('description'),
    billToName: text('bill_to_name'),
    billToStreet: text('bill_to_street'),
    billToCity: text('bill_to_city'),
    billToState: text('bill_to_state'),
    billToZip: text('bill_to_zip'),
    billToCountry: text('bill_to_country'),
    createdAt: timestamp('created_at').default(sql`now()`),
    updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const quoteLineItems = pgTable('crm_quote_line_items', {
    id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
    quoteId: varchar('quote_id').references(() => quotes.id).notNull(),
    productId: varchar('product_id').references(() => products.id),
    quantity: integer('quantity').notNull().default(1),
    unitPrice: numeric('unit_price').notNull(),
    totalPrice: numeric('total_price'),
    description: text('description'),
    createdAt: timestamp('created_at').default(sql`now()`),
});

export const orders = pgTable('crm_orders', {
    id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
    accountId: varchar('account_id').references(() => accounts.id),
    quoteId: varchar('quote_id').references(() => quotes.id),
    opportunityId: varchar('opportunity_id').references(() => opportunities.id),
    orderNumber: text('order_number'),
    status: text('status').default('Draft'), // Draft, Activated, Fulfilled, Cancelled
    totalAmount: numeric('total_amount').default('0'),
    effectiveDate: timestamp('effective_date').default(sql`now()`),
    billingAddress: text('billing_address'),
    shippingAddress: text('shipping_address'),
    createdAt: timestamp('created_at').default(sql`now()`),
    updatedAt: timestamp('updated_at').default(sql`now()`),
});

// Cases (Service Cloud)
export const cases = pgTable('crm_cases', {
    id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
    subject: text('subject').notNull(),
    description: text('description'),
    status: text('status').default('New'), // New, Open, Closed
    priority: text('priority').default('Medium'), // Low, Medium, High
    origin: text('origin'), // Email, Phone, Web
    accountId: varchar('account_id').references(() => accounts.id),
    contactId: varchar('contact_id').references(() => contacts.id),
    userId: text('user_id'), // Assigned User (legacy text id for now)
    createdAt: timestamp('created_at').default(sql`now()`),
    updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const caseComments = pgTable('crm_case_comments', {
    id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
    caseId: varchar('case_id').references(() => cases.id).notNull(),
    body: text('body').notNull(),
    isPublic: boolean('is_public').default(false),
    createdById: text('created_by_id'), // User ID
    createdAt: timestamp('created_at').default(sql`now()`),
});

// APIs

export const insertProductSchema = createInsertSchema(products).extend({
    name: z.string().min(1, "Product name is required"),
});

export const insertPriceBookSchema = createInsertSchema(priceBooks).extend({
    name: z.string().min(1, "Price Book name is required"),
});

export const insertPriceBookEntrySchema = createInsertSchema(priceBookEntries).extend({
    unitPrice: z.number().or(z.string().transform(v => Number(v))),
});

export const insertLineItemSchema = createInsertSchema(opportunityLineItems).extend({
    quantity: z.number().min(1),
    unitPrice: z.number().or(z.string().transform(v => Number(v))),
    totalPrice: z.number().or(z.string().transform(v => Number(v))).optional(), // Computed
});

export const insertQuoteSchema = createInsertSchema(quotes).extend({
    name: z.string().min(1, "Quote name is required"),
    expirationDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
    totalAmount: z.number().or(z.string().transform(v => Number(v))).optional(),
});

export const insertQuoteLineItemSchema = createInsertSchema(quoteLineItems).extend({
    quantity: z.number().min(1),
    unitPrice: z.number().or(z.string().transform(v => Number(v))),
    totalPrice: z.number().or(z.string().transform(v => Number(v))).optional(),
});

export const insertOrderSchema = createInsertSchema(orders).extend({
    effectiveDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
    totalAmount: z.number().or(z.string().transform(v => Number(v))).optional(),
});

export const insertCaseSchema = createInsertSchema(cases).extend({
    subject: z.string().min(1, "Subject is required"),
    priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
    status: z.enum(["New", "Open", "Closed"]).default("New"),
});

export const insertCaseCommentSchema = createInsertSchema(caseComments).extend({
    body: z.string().min(1, "Comment body is required"),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type PriceBook = typeof priceBooks.$inferSelect;
export type InsertPriceBook = z.infer<typeof insertPriceBookSchema>;

export type PriceBookEntry = typeof priceBookEntries.$inferSelect;
export type InsertPriceBookEntry = z.infer<typeof insertPriceBookEntrySchema>;

export type OpportunityLineItem = typeof opportunityLineItems.$inferSelect;
export type InsertOpportunityLineItem = z.infer<typeof insertLineItemSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type QuoteLineItem = typeof quoteLineItems.$inferSelect;
export type InsertQuoteLineItem = z.infer<typeof insertQuoteLineItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Case = typeof cases.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;

export type CaseComment = typeof caseComments.$inferSelect;
export type InsertCaseComment = z.infer<typeof insertCaseCommentSchema>;

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export type InsertInteraction = z.infer<typeof insertInteractionSchema>;
export type Interaction = typeof interactions.$inferSelect;
