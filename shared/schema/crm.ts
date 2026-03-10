import { pgTable, text, integer, boolean, timestamp, jsonb, numeric, varchar, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { hzParties } from "./parties";

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
    entBusinessUnitId: varchar("ent_business_unit_id"),
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
    territoryId: varchar("territory_id").references(() => territories.id), // Added Phase 21.3
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
    ownerId: varchar("owner_id"),
    entBusinessUnitId: varchar("ent_business_unit_id"),

    // TCA Linkage (Organization Party)
    partyId: varchar("party_id").references(() => hzParties.id),
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
    entBusinessUnitId: varchar("ent_business_unit_id"),

    // TCA Linkage (Person Party)
    partyId: varchar("party_id").references(() => hzParties.id),
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
    entBusinessUnitId: varchar("ent_business_unit_id"),
});

export const insertCampaignSchema = createInsertSchema(campaigns).extend({
    name: z.string().min(1, "Campaign name is required"),
    startDate: z.coerce.date().optional().nullable(),
    endDate: z.coerce.date().optional().nullable(),
    expectedRevenue: z.number().or(z.string().transform(v => Number(v))).optional().nullable(),
    budgetedCost: z.number().or(z.string().transform(v => Number(v))).optional().nullable(),
    actualCost: z.number().or(z.string().transform(v => Number(v))).optional().nullable(),
});

export const campaignMembers = pgTable("crm_campaign_members", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    campaignId: varchar("campaign_id").references(() => campaigns.id).notNull(),
    leadId: varchar("lead_id").references(() => leads.id),
    contactId: varchar("contact_id").references(() => contacts.id),
    status: varchar("status").default("Sent"), // Sent, Responded, Connected
    responseDate: timestamp("response_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCampaignMemberSchema = createInsertSchema(campaignMembers).extend({
    campaignId: z.string().min(1),
    status: z.string().optional(),
});

// --- Marketing UTM & Analytics (Phase 28) ---
export const utmCampaigns = pgTable("crm_utm_campaigns", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    campaignId: varchar("campaign_id").references(() => campaigns.id),
    utmSource: varchar("utm_source").notNull(),
    utmMedium: varchar("utm_medium").notNull(),
    utmCampaignText: varchar("utm_campaign_text").notNull(),
    utmTerm: varchar("utm_term"),
    utmContent: varchar("utm_content"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const pageVisits = pgTable("crm_page_visits", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    visitorId: varchar("visitor_id"), // Anonymous tracking cookie id
    leadId: varchar("lead_id").references(() => leads.id),
    contactId: varchar("contact_id").references(() => contacts.id),
    url: text("url").notNull(),
    referrer: text("referrer"),
    utmCampaignId: varchar("utm_campaign_id").references(() => utmCampaigns.id),
    visitedAt: timestamp("visited_at").default(sql`now()`),
});

export const abTests = pgTable("crm_ab_tests", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    campaignId: varchar("campaign_id").references(() => campaigns.id),
    status: varchar("status").default("Draft"), // Draft, Live, Completed
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    winningVariantId: varchar("winning_variant_id"), // FK added later in app logic
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const abTestVariants = pgTable("crm_ab_test_variants", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    abTestId: varchar("ab_test_id").references(() => abTests.id).notNull(),
    name: varchar("name").notNull(), // e.g. "Control", "Variant A"
    subjectLine: text("subject_line"),
    bodyContent: text("body_content"),
    weight: integer("weight").default(50), // Percentage of traffic
    sends: integer("sends").default(0),
    opens: integer("opens").default(0),
    clicks: integer("clicks").default(0),
});

export const insertUtmCampaignSchema = createInsertSchema(utmCampaigns);
export const insertPageVisitSchema = createInsertSchema(pageVisits);
export const insertAbTestSchema = createInsertSchema(abTests).extend({
    name: z.string().min(1, "A/B Test Name is required"),
});
export const insertAbTestVariantSchema = createInsertSchema(abTestVariants);

export type UtmCampaign = typeof utmCampaigns.$inferSelect;
export type InsertUtmCampaign = z.infer<typeof insertUtmCampaignSchema>;

export type PageVisit = typeof pageVisits.$inferSelect;
export type InsertPageVisit = z.infer<typeof insertPageVisitSchema>;

export type AbTest = typeof abTests.$inferSelect;
export type InsertAbTest = z.infer<typeof insertAbTestSchema>;

export type AbTestVariant = typeof abTestVariants.$inferSelect;
export type InsertAbTestVariant = z.infer<typeof insertAbTestVariantSchema>;

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
    priceBookId: varchar("price_book_id"), // Link to Price Book

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
    ownerId: varchar("owner_id"),
    entBusinessUnitId: varchar("ent_business_unit_id"),
    winLossReason: varchar("win_loss_reason"),
});

export const insertOpportunitySchema = createInsertSchema(opportunities).extend({
    name: z.string().min(1, "Opportunity name is required"),
    amount: z.number().or(z.string().transform(v => Number(v))).optional().nullable().default(0),
    probability: z.number().or(z.string().transform(v => Number(v))).optional().nullable(),
    closeDate: z.coerce.date().optional().nullable(),
    priceBookId: z.string().optional().nullable(),
    winLossReason: z.string().optional().nullable(),
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
    productId: varchar('product_id').references(() => products.id), // Change from uuid to varchar to match products.id
    priceBookEntryId: varchar('price_book_entry_id'), // Change from uuid to varchar to match priceBookEntries.id
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
    priceBookId: varchar('price_book_id'), // CPQ Support
    entBusinessUnitId: varchar('ent_business_unit_id'),
});

export const quoteLineItems = pgTable('crm_quote_line_items', {
    id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
    quoteId: varchar('quote_id').references(() => quotes.id).notNull(),
    productId: varchar('product_id').references(() => products.id),
    quantity: integer('quantity').notNull().default(1),
    unitPrice: numeric('unit_price').notNull(),
    totalPrice: numeric('total_price'),
    description: text('description'),
    priceBookEntryId: varchar('price_book_entry_id'), // CPQ Support
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
    entBusinessUnitId: varchar('ent_business_unit_id'),
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
    entBusinessUnitId: varchar('ent_business_unit_id'),
});

export const caseComments = pgTable('crm_case_comments', {
    id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
    caseId: varchar('case_id').references(() => cases.id).notNull(),
    body: text('body').notNull(),
    isPublic: boolean('is_public').default(false),
    createdById: text('created_by_id'), // User ID
    createdAt: timestamp('created_at').default(sql`now()`),
});

// --- Service Cloud Advanced (Phase 30) ---
export const emailToCaseRoutingRules = pgTable("crm_email_to_case_routing_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    supportAlias: varchar("support_alias").notNull(), // e.g. support@nexusai.com
    priority: integer("priority").default(1),
    routingQueue: varchar("routing_queue").notNull(), // e.g. "Tier 1 Support"
    keywordTriggers: text("keyword_triggers").array(), // e.g. ["urgent", "escalate"]
    autoResponseTemplateId: varchar("auto_response_template_id"), // FK to email templates if implemented
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const csatSurveys = pgTable("crm_csat_surveys", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    triggerEvent: varchar("trigger_event").default("Case Closed"), // Only event for now
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const csatResponses = pgTable("crm_csat_responses", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    surveyId: varchar("survey_id").references(() => csatSurveys.id).notNull(),
    caseId: varchar("case_id").references(() => cases.id),
    contactId: varchar("contact_id").references(() => contacts.id),
    score: integer("score").notNull(), // e.g. 1-5
    feedback: text("feedback"),
    submittedAt: timestamp("submitted_at").default(sql`now()`),
});

export const insertEmailToCaseRoutingRuleSchema = createInsertSchema(emailToCaseRoutingRules).extend({
    supportAlias: z.string().email("Must be a valid email alias"),
});
export const insertCsatSurveySchema = createInsertSchema(csatSurveys).extend({
    name: z.string().min(1, "Survey Name is required"),
});
export const insertCsatResponseSchema = createInsertSchema(csatResponses).extend({
    score: z.number().min(1).max(5),
});

export type EmailToCaseRoutingRule = typeof emailToCaseRoutingRules.$inferSelect;
export type InsertEmailToCaseRoutingRule = z.infer<typeof insertEmailToCaseRoutingRuleSchema>;

export type CsatSurvey = typeof csatSurveys.$inferSelect;
export type InsertCsatSurvey = z.infer<typeof insertCsatSurveySchema>;

export type CsatResponse = typeof csatResponses.$inferSelect;
export type InsertCsatResponse = z.infer<typeof insertCsatResponseSchema>;

// Field Service (Phase 26)
export const serviceWorkOrders = pgTable('crm_service_work_orders', {
    id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
    workOrderNumber: text('work_order_number'), // Auto-gen
    caseId: varchar('case_id').references(() => cases.id),
    accountId: varchar('account_id').references(() => accounts.id),
    contactId: varchar('contact_id').references(() => contacts.id),
    subject: text('subject').notNull(),
    description: text('description'),
    status: text('status').default('New'), // New, Scheduled, In Progress, Completed, Canceled
    priority: text('priority').default('Medium'),
    street: text('street'),
    city: text('city'),
    state: text('state'),
    postalCode: text('postal_code'),
    country: text('country'),
    createdAt: timestamp('created_at').default(sql`now()`),
});

export const serviceAppointments = pgTable('crm_service_appointments', {
    id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
    workOrderId: varchar('work_order_id').references(() => serviceWorkOrders.id).notNull(),
    technicianId: text('technician_id'), // User ID
    scheduledStart: timestamp('scheduled_start'),
    scheduledEnd: timestamp('scheduled_end'),
    actualStart: timestamp('actual_start'),
    actualEnd: timestamp('actual_end'),
    status: text('status').default('None'), // None, Scheduled, Dispatched, In Progress, Completed
    createdAt: timestamp('created_at').default(sql`now()`),
});

export const insertServiceWorkOrderSchema = createInsertSchema(serviceWorkOrders).extend({
    subject: z.string().min(1, "Subject is required"),
});

export const insertServiceAppointmentSchema = createInsertSchema(serviceAppointments).extend({
    workOrderId: z.string().min(1),
    scheduledStart: z.coerce.date().optional(),
    scheduledEnd: z.coerce.date().optional(),
});

// Knowledge Base (Phase 27)
export const knowledgeArticles = pgTable('crm_knowledge_articles', {
    id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
    title: text('title').notNull(),
    content: text('content').notNull(),
    category: text('category'), // e.g., Technical, Billing, General
    status: text('status').default('Draft'), // Draft, Published, Archived
    tags: text('tags').array(),
    authorId: text('author_id'), // User ID
    createdAt: timestamp('created_at').default(sql`now()`),
    updatedAt: timestamp('updated_at').default(sql`now()`),
});

export const insertKnowledgeArticleSchema = createInsertSchema(knowledgeArticles).extend({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
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
    priceBookId: z.string().optional().nullable(),
});

export const insertQuoteLineItemSchema = createInsertSchema(quoteLineItems).extend({
    quantity: z.number().min(1),
    unitPrice: z.number().or(z.string().transform(v => Number(v))),
    totalPrice: z.number().or(z.string().transform(v => Number(v))).optional(),
    priceBookEntryId: z.string().optional().nullable(),
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

// --- Approvals (Workflow) ---
export const approvalRequests = pgTable("crm_approval_requests", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    entityType: varchar("entity_type").notNull(), // quote, opportunity, discount
    entityId: varchar("entity_id").notNull(),
    requesterId: varchar("requester_id").notNull(), // user_id
    approverId: varchar("approver_id"), // user_id (optional, if assigned)
    status: varchar("status").default("Pending"), // Pending, Approved, Rejected
    reason: text("reason"), // Justification for request
    comments: text("comments"), // Approver comments
    requestedAt: timestamp("requested_at").default(sql`now()`),
    respondedAt: timestamp("responded_at"),
});

export const insertApprovalRequestSchema = createInsertSchema(approvalRequests).extend({
    entityType: z.string().min(1),
    entityId: z.string().min(1),
    requesterId: z.string().min(1),
    reason: z.string().optional(),
});

export type InsertApprovalRequest = z.infer<typeof insertApprovalRequestSchema>;
export type ApprovalRequest = typeof approvalRequests.$inferSelect;

// --- Sales Quotas (Phase 21) ---
export const salesQuotas = pgTable("crm_quotas", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(), // Assigned Rep
    territoryId: varchar("territory_id").references(() => territories.id), // Added for alignment
    productId: varchar("product_id").references(() => products.id), // Added for product-specific quotas
    periodName: varchar("period_name").notNull(), // e.g. "Q1-2026", "Jan-2026"
    quotaAmount: numeric("quota_amount").notNull().default("0"),
    currencyCode: varchar("currency_code").default("USD"),
    targetType: varchar("target_type").default("Revenue"), // Revenue, Deal Count, Activity
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertSalesQuotaSchema = createInsertSchema(salesQuotas).extend({
    quotaAmount: z.number().or(z.string().transform(v => Number(v))),
});

export type SalesQuota = typeof salesQuotas.$inferSelect;
export type InsertSalesQuota = z.infer<typeof insertSalesQuotaSchema>;

// --- Competitor Intelligence (Phase 21) ---
export const competitors = pgTable("crm_competitors", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull().unique(),
    website: varchar("website"),
    strengths: text("strengths"),
    weaknesses: text("weaknesses"),
    threatLevel: varchar("threat_level").default("Medium"), // Low, Medium, High
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const opportunityCompetitors = pgTable("crm_opportunity_competitors", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    opportunityId: varchar("opportunity_id").references(() => opportunities.id).notNull(),
    competitorId: varchar("competitor_id").references(() => competitors.id).notNull(),
    status: varchar("status").default("Active"), // Active, Winning, Lost To
    notes: text("notes"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCompetitorSchema = createInsertSchema(competitors).extend({
    name: z.string().min(1, "Competitor Name is required"),
});

export const insertOpportunityCompetitorSchema = createInsertSchema(opportunityCompetitors);

export type Competitor = typeof competitors.$inferSelect;
export type InsertCompetitor = z.infer<typeof insertCompetitorSchema>;

export type OpportunityCompetitor = typeof opportunityCompetitors.$inferSelect;
export type InsertOpportunityCompetitor = z.infer<typeof insertOpportunityCompetitorSchema>;

// --- Territory Management (Phase 21.3) ---
export const territories = pgTable("crm_territories", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    parentId: varchar("parent_id"), // Self-referencing FK logic handled in app
    ownerId: varchar("owner_id"), // Sales Rep assigned to this territory
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const territoryRules = pgTable("crm_territory_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    territoryId: varchar("territory_id").references(() => territories.id).notNull(),
    priority: integer("priority").default(1),
    field: varchar("field").notNull(), // e.g., "billingState", "industry", "annualRevenue"
    operator: varchar("operator").notNull(), // "equals", "contains", "gt", "lt"
    value: varchar("value").notNull(),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertTerritorySchema = createInsertSchema(territories).extend({
    name: z.string().min(1, "Territory Name is required"),
});

export const insertTerritoryRuleSchema = createInsertSchema(territoryRules).extend({
    field: z.string().min(1),
    operator: z.enum(["equals", "contains", "gt", "lt"]),
    value: z.string().min(1),
});

export type Territory = typeof territories.$inferSelect;
export type InsertTerritory = z.infer<typeof insertTerritorySchema>;


// --- CPQ Product Rules (Phase 29) ---
export const cpqRules = pgTable("crm_cpq_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    baseProductId: varchar("base_product_id").references(() => products.id).notNull(),
    targetProductId: varchar("target_product_id").references(() => products.id).notNull(),
    ruleType: varchar("rule_type").notNull().default("REQUIRE"), // REQUIRE, EXCLUDE, RECOMMEND
    conditionField: varchar("condition_field"), // Optional: field on the quote/opportunity that needs to match
    conditionValue: varchar("condition_value"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCpqRuleSchema = createInsertSchema(cpqRules).extend({
    name: z.string().min(1, "Rule Name is required"),
});

export type CpqRule = typeof cpqRules.$inferSelect;
export type InsertCpqRule = z.infer<typeof insertCpqRuleSchema>;

// --- Guided Selling (Phase 29) ---
export const guidedSellingQuestions = pgTable("crm_guided_selling_questions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    questionText: text("question_text").notNull(),
    questionType: varchar("question_type").default("single_choice"), // single_choice, multi_choice, text
    sequenceIndex: integer("sequence_index").default(0),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const guidedSellingOptions = pgTable("crm_guided_selling_options", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    questionId: varchar("question_id").references(() => guidedSellingQuestions.id).notNull(),
    optionText: text("option_text").notNull(),
    recommendedProductId: varchar("recommended_product_id").references(() => products.id),
    scoreImpact: integer("score_impact").default(0),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGuidedSellingQuestionSchema = createInsertSchema(guidedSellingQuestions).extend({
    questionText: z.string().min(1, "Question Text is required"),
});
export const insertGuidedSellingOptionSchema = createInsertSchema(guidedSellingOptions).extend({
    optionText: z.string().min(1, "Option Text is required"),
});

export type GuidedSellingQuestion = typeof guidedSellingQuestions.$inferSelect;
export type InsertGuidedSellingQuestion = z.infer<typeof insertGuidedSellingQuestionSchema>;

export type GuidedSellingOption = typeof guidedSellingOptions.$inferSelect;
export type InsertGuidedSellingOption = z.infer<typeof insertGuidedSellingOptionSchema>;

// --- Complex Approval Rules (Phase 29) ---
export const crmApprovalRules = pgTable("crm_approval_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    entityType: varchar("entity_type").notNull().default("QUOTE"), // QUOTE, OPPORTUNITY
    conditionField: varchar("condition_field").notNull(), // e.g. "discountPercentage"
    operator: varchar("operator").notNull(), // ">", ">=", "<"
    thresholdValue: numeric("threshold_value").notNull(), // e.g. 20 (for 20%)
    approverRoleId: varchar("approver_role_id"), // E.g., VP of Sales
    approverUserId: varchar("approver_user_id"), // Specific user override
    priority: integer("priority").default(1),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCrmApprovalRuleSchema = createInsertSchema(crmApprovalRules).extend({
    name: z.string().min(1, "Rule Name is required"),
});

export type CrmApprovalRule = typeof crmApprovalRules.$inferSelect;
export type InsertCrmApprovalRule = z.infer<typeof insertCrmApprovalRuleSchema>;

// --- Incentive Compensation (Phase 22) ---

export const commissionPlans = pgTable("crm_commission_plans", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    type: varchar("type").notNull().default("flat_rate"), // "flat_rate", "percentage_deal_value", "percentage_profit"
    rate: numeric("rate").notNull(), // e.g. 5.0 for 5%, or 500 for $500
    quotaThreshold: numeric("quota_threshold"), // Optional: Only pay if quota > X%
    customFormula: text("custom_formula"), // For complex logic
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// Link Users to Plans
export const commissionAssignments = pgTable("crm_commission_assignments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(), // Linking to users.id
    planId: varchar("plan_id").references(() => commissionPlans.id).notNull(),
    effectiveDate: timestamp("effective_date").default(sql`now()`),
});

export const commissions = pgTable("crm_commissions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    opportunityId: varchar("opportunity_id").references(() => opportunities.id).notNull(),
    userId: varchar("user_id").notNull(), // Sales Rep
    planId: varchar("plan_id").references(() => commissionPlans.id),
    baseAmount: numeric("base_amount").notNull(), // The deal value used
    commissionAmount: numeric("commission_amount").notNull(), // The calculated payout
    status: varchar("status").default("pending"), // pending, approved, paid
    generatedAt: timestamp("generated_at").default(sql`now()`),
    paidAt: timestamp("paid_at"),
    entBusinessUnitId: varchar("ent_business_unit_id"),
});

export const insertCommissionPlanSchema = createInsertSchema(commissionPlans).extend({
    name: z.string().min(1),
    rate: z.number().or(z.string()),
});

export const insertCommissionAssignmentSchema = createInsertSchema(commissionAssignments);
export const insertCommissionSchema = createInsertSchema(commissions);

export type CommissionPlan = typeof commissionPlans.$inferSelect;
export type CommissionAssignment = typeof commissionAssignments.$inferSelect;
export type Commission = typeof commissions.$inferSelect;

// --- Advanced Incentive Compensation (Phase 32) ---
export const commissionClawbacks = pgTable("crm_commission_clawbacks", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    commissionId: varchar("commission_id").references(() => commissions.id).notNull(),
    userId: varchar("user_id").notNull(),
    clawbackAmount: numeric("clawback_amount").notNull(),
    reason: text("reason").notNull(), // e.g. "Refund", "Cancellation"
    status: varchar("status").default("pending"), // pending, applied
    appliedAt: timestamp("applied_at"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const commissionPlanAgreements = pgTable("crm_commission_plan_agreements", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    planId: varchar("plan_id").references(() => commissionPlans.id).notNull(),
    status: varchar("status").default("Pending Signature"), // Pending Signature, Signed, Rejected
    signedAt: timestamp("signed_at"),
    ipAddress: varchar("ip_address"),
    documentHash: varchar("document_hash"), // Verifiable signature tracking
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCommissionClawbackSchema = createInsertSchema(commissionClawbacks).extend({
    clawbackAmount: z.number().or(z.string().transform(v => Number(v))),
});
export const insertCommissionPlanAgreementSchema = createInsertSchema(commissionPlanAgreements);

export type CommissionClawback = typeof commissionClawbacks.$inferSelect;
export type InsertCommissionClawback = z.infer<typeof insertCommissionClawbackSchema>;

export type CommissionPlanAgreement = typeof commissionPlanAgreements.$inferSelect;
export type InsertCommissionPlanAgreement = z.infer<typeof insertCommissionPlanAgreementSchema>;

// --- Sales Forecasting (Phase 27.5) ---
export const forecasts = pgTable("crm_forecasts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(), // The sales rep or manager
    periodName: varchar("period_name").notNull(), // e.g., "Q1-2026"
    amount: numeric("amount").notNull().default("0"), // The rolled-up/calculated amount
    category: varchar("category").notNull().default("Commit"), // Pipeline, Best Case, Commit, Closed
    status: varchar("status").default("Draft"), // Draft, Submitted, Approved
    notes: text("notes"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
    entBusinessUnitId: varchar("ent_business_unit_id"),
});

export const forecastAdjustments = pgTable("crm_forecast_adjustments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    forecastId: varchar("forecast_id").references(() => forecasts.id).notNull(),
    managerId: varchar("manager_id").notNull(), // The manager making the adjustment
    adjustedAmount: numeric("adjusted_amount").notNull(), // The new amount
    adjustmentReason: text("adjustment_reason"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertForecastSchema = createInsertSchema(forecasts).extend({
    amount: z.number().or(z.string().transform(v => Number(v))),
});

export const insertForecastAdjustmentSchema = createInsertSchema(forecastAdjustments).extend({
    adjustedAmount: z.number().or(z.string().transform(v => Number(v))),
});

export type Forecast = typeof forecasts.$inferSelect;
export type InsertForecast = z.infer<typeof insertForecastSchema>;

export type ForecastAdjustment = typeof forecastAdjustments.$inferSelect;
export type InsertForecastAdjustment = z.infer<typeof insertForecastAdjustmentSchema>;

// === Deep Granular Parity Additions (Phase 7) ===

// --- Sales Methodologies & Playbooks ---
export const crmSalesPlaybooks = pgTable("crm_sales_playbooks", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    stageRule: varchar("stage_rule").notNull(), // e.g. "qualification", "negotiation"
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const crmPlaybookTasks = pgTable("crm_playbook_tasks", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    playbookId: varchar("playbook_id").references(() => crmSalesPlaybooks.id).notNull(),
    taskName: varchar("task_name").notNull(),
    isRequired: boolean("is_required").default(true),
    orderIndex: integer("order_index").default(0),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCrmSalesPlaybookSchema = createInsertSchema(crmSalesPlaybooks);
export const insertCrmPlaybookTaskSchema = createInsertSchema(crmPlaybookTasks);

export type CrmSalesPlaybook = typeof crmSalesPlaybooks.$inferSelect;
export type InsertCrmSalesPlaybook = z.infer<typeof insertCrmSalesPlaybookSchema>;
export type CrmPlaybookTask = typeof crmPlaybookTasks.$inferSelect;
export type InsertCrmPlaybookTask = z.infer<typeof insertCrmPlaybookTaskSchema>;

// --- Service Entitlements & Warranties ---
export const crmServiceEntitlements = pgTable("crm_service_entitlements", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    accountId: varchar("account_id").references(() => accounts.id).notNull(),
    contractNumber: varchar("contract_number").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    slaLevel: varchar("sla_level").notNull(), // Gold, Silver, Bronze
    status: varchar("status").default("active"),
    coverageDetails: text("coverage_details"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCrmServiceEntitlementSchema = createInsertSchema(crmServiceEntitlements);
export type CrmServiceEntitlement = typeof crmServiceEntitlements.$inferSelect;
export type InsertCrmServiceEntitlement = z.infer<typeof insertCrmServiceEntitlementSchema>;
