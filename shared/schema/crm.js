"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTerritoryRuleSchema = exports.insertTerritorySchema = exports.territoryRules = exports.territories = exports.insertOpportunityCompetitorSchema = exports.insertCompetitorSchema = exports.opportunityCompetitors = exports.competitors = exports.insertSalesQuotaSchema = exports.salesQuotas = exports.insertApprovalRequestSchema = exports.approvalRequests = exports.insertCaseCommentSchema = exports.insertCaseSchema = exports.insertOrderSchema = exports.insertQuoteLineItemSchema = exports.insertQuoteSchema = exports.insertLineItemSchema = exports.insertPriceBookEntrySchema = exports.insertPriceBookSchema = exports.insertProductSchema = exports.insertKnowledgeArticleSchema = exports.knowledgeArticles = exports.insertServiceAppointmentSchema = exports.insertServiceWorkOrderSchema = exports.serviceAppointments = exports.serviceWorkOrders = exports.caseComments = exports.cases = exports.orders = exports.quoteLineItems = exports.quotes = exports.opportunityLineItems = exports.priceBookEntries = exports.priceBooks = exports.products = exports.insertInteractionSchema = exports.interactions = exports.insertOpportunitySchema = exports.opportunities = exports.insertCampaignMemberSchema = exports.campaignMembers = exports.insertCampaignSchema = exports.campaigns = exports.insertContactSchema = exports.contacts = exports.insertAccountSchema = exports.accounts = exports.insertLeadSchema = exports.leads = void 0;
exports.insertCommissionSchema = exports.insertCommissionAssignmentSchema = exports.insertCommissionPlanSchema = exports.commissions = exports.commissionAssignments = exports.commissionPlans = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const parties_1 = require("./parties");
// ========== CRM MODULE ==========
// --- Leads ---
exports.leads = (0, pg_core_1.pgTable)("leads", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    // Core Info
    salutation: (0, pg_core_1.varchar)("salutation"), // Mr. Ms. Dr.
    firstName: (0, pg_core_1.varchar)("first_name"),
    lastName: (0, pg_core_1.varchar)("last_name").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(), // Full name (computed or entered)
    title: (0, pg_core_1.varchar)("title"),
    company: (0, pg_core_1.varchar)("company"),
    // Contact Info
    email: (0, pg_core_1.varchar)("email"),
    phone: (0, pg_core_1.varchar)("phone"),
    mobilePhone: (0, pg_core_1.varchar)("mobile_phone"),
    website: (0, pg_core_1.varchar)("website"),
    // Address Info
    street: (0, pg_core_1.text)("street"),
    city: (0, pg_core_1.varchar)("city"),
    state: (0, pg_core_1.varchar)("state"),
    postalCode: (0, pg_core_1.varchar)("postal_code"),
    country: (0, pg_core_1.varchar)("country"),
    // Qualification
    leadSource: (0, pg_core_1.varchar)("lead_source"),
    status: (0, pg_core_1.varchar)("status").default("new"), // new, working, nurturing, converted, unqualified
    industry: (0, pg_core_1.varchar)("industry"),
    rating: (0, pg_core_1.varchar)("rating"), // Hot, Warm, Cold
    annualRevenue: (0, pg_core_1.numeric)("annual_revenue"),
    numberOfEmployees: (0, pg_core_1.integer)("number_of_employees"),
    // System/Scoring
    score: (0, pg_core_1.numeric)("score", { precision: 5, scale: 2 }).default("0"),
    isConverted: (0, pg_core_1.integer)("is_converted").default(0), // Boolean 0/1
    convertedDate: (0, pg_core_1.timestamp)("converted_date"),
    convertedAccountId: (0, pg_core_1.varchar)("converted_account_id"),
    convertedContactId: (0, pg_core_1.varchar)("converted_contact_id"),
    convertedOpportunityId: (0, pg_core_1.varchar)("converted_opportunity_id"),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
    ownerId: (0, pg_core_1.varchar)("owner_id"),
});
exports.insertLeadSchema = (0, drizzle_zod_1.createInsertSchema)(exports.leads).extend({
    lastName: zod_1.z.string().min(1, "Last Name is required"),
    name: zod_1.z.string().min(1, "Full Name is required"),
    email: zod_1.z.string().email().optional().nullable().or(zod_1.z.literal("")),
    annualRevenue: zod_1.z.number().or(zod_1.z.string().transform(v => Number(v))).optional().nullable(),
});
// --- Accounts (Companies) ---
exports.accounts = (0, pg_core_1.pgTable)("accounts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    parentAccountId: (0, pg_core_1.varchar)("parent_account_id"),
    type: (0, pg_core_1.varchar)("type"), // Prospect, Customer - Direct, Channel Partner, etc.
    industry: (0, pg_core_1.varchar)("industry"),
    rating: (0, pg_core_1.varchar)("rating"),
    // Billing Address
    billingStreet: (0, pg_core_1.text)("billing_street"),
    billingCity: (0, pg_core_1.varchar)("billing_city"),
    billingState: (0, pg_core_1.varchar)("billing_state"),
    billingPostalCode: (0, pg_core_1.varchar)("billing_postal_code"),
    billingCountry: (0, pg_core_1.varchar)("billing_country"),
    // Shipping Address
    shippingStreet: (0, pg_core_1.text)("shipping_street"),
    shippingCity: (0, pg_core_1.varchar)("shipping_city"),
    shippingState: (0, pg_core_1.varchar)("shipping_state"),
    shippingPostalCode: (0, pg_core_1.varchar)("shipping_postal_code"),
    shippingCountry: (0, pg_core_1.varchar)("shipping_country"),
    phone: (0, pg_core_1.varchar)("phone"),
    fax: (0, pg_core_1.varchar)("fax"),
    website: (0, pg_core_1.varchar)("website"),
    annualRevenue: (0, pg_core_1.numeric)("annual_revenue"),
    numberOfEmployees: (0, pg_core_1.integer)("number_of_employees"),
    ownership: (0, pg_core_1.varchar)("ownership"), // Public, Private, Subsidiary
    tickerSymbol: (0, pg_core_1.varchar)("ticker_symbol"),
    description: (0, pg_core_1.text)("description"),
    status: (0, pg_core_1.varchar)("status").default("active"),
    territoryId: (0, pg_core_1.varchar)("territory_id").references(() => exports.territories.id), // Added Phase 21.3
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
    ownerId: (0, pg_core_1.varchar)("owner_id"),
    // TCA Linkage (Organization Party)
    partyId: (0, pg_core_1.varchar)("party_id").references(() => parties_1.hzParties.id),
});
exports.insertAccountSchema = (0, drizzle_zod_1.createInsertSchema)(exports.accounts).extend({
    name: zod_1.z.string().min(1, "Account name is required"),
    annualRevenue: zod_1.z.number().or(zod_1.z.string().transform(v => Number(v))).optional().nullable(),
});
// --- Contacts (People) ---
exports.contacts = (0, pg_core_1.pgTable)("contacts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    accountId: (0, pg_core_1.varchar)("account_id"), // FK to accounts
    salutation: (0, pg_core_1.varchar)("salutation"),
    firstName: (0, pg_core_1.varchar)("first_name").notNull(),
    lastName: (0, pg_core_1.varchar)("last_name").notNull(),
    email: (0, pg_core_1.varchar)("email"),
    phone: (0, pg_core_1.varchar)("phone"),
    mobilePhone: (0, pg_core_1.varchar)("mobile_phone"),
    homePhone: (0, pg_core_1.varchar)("home_phone"),
    title: (0, pg_core_1.varchar)("title"),
    department: (0, pg_core_1.varchar)("department"),
    assistantName: (0, pg_core_1.varchar)("assistant_name"),
    assistantPhone: (0, pg_core_1.varchar)("assistant_phone"),
    leadSource: (0, pg_core_1.varchar)("lead_source"),
    // Mailing Address
    mailingStreet: (0, pg_core_1.text)("mailing_street"),
    mailingCity: (0, pg_core_1.varchar)("mailing_city"),
    mailingState: (0, pg_core_1.varchar)("mailing_state"),
    mailingPostalCode: (0, pg_core_1.varchar)("mailing_postal_code"),
    mailingCountry: (0, pg_core_1.varchar)("mailing_country"),
    description: (0, pg_core_1.text)("description"),
    birthdate: (0, pg_core_1.timestamp)("birthdate"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
    ownerId: (0, pg_core_1.varchar)("owner_id"),
    // TCA Linkage (Person Party)
    partyId: (0, pg_core_1.varchar)("party_id").references(() => parties_1.hzParties.id),
});
exports.insertContactSchema = (0, drizzle_zod_1.createInsertSchema)(exports.contacts).extend({
    firstName: zod_1.z.string().min(1, "First name is required"),
    lastName: zod_1.z.string().min(1, "Last name is required"),
    email: zod_1.z.string().email().optional().nullable().or(zod_1.z.literal("")),
});
// --- Campaigns ---
exports.campaigns = (0, pg_core_1.pgTable)("campaigns", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    type: (0, pg_core_1.varchar)("type"), // Conference, Webinar, Email, etc.
    status: (0, pg_core_1.varchar)("status").default("Planned"), // Planned, In Progress, Completed, Aborted
    startDate: (0, pg_core_1.timestamp)("start_date"),
    endDate: (0, pg_core_1.timestamp)("end_date"),
    expectedRevenue: (0, pg_core_1.numeric)("expected_revenue"),
    budgetedCost: (0, pg_core_1.numeric)("budgeted_cost"),
    actualCost: (0, pg_core_1.numeric)("actual_cost"),
    isActive: (0, pg_core_1.integer)("is_active").default(1),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
    ownerId: (0, pg_core_1.varchar)("owner_id"),
});
exports.insertCampaignSchema = (0, drizzle_zod_1.createInsertSchema)(exports.campaigns).extend({
    name: zod_1.z.string().min(1, "Campaign name is required"),
    startDate: zod_1.z.coerce.date().optional().nullable(),
    endDate: zod_1.z.coerce.date().optional().nullable(),
    expectedRevenue: zod_1.z.number().or(zod_1.z.string().transform(v => Number(v))).optional().nullable(),
    budgetedCost: zod_1.z.number().or(zod_1.z.string().transform(v => Number(v))).optional().nullable(),
    actualCost: zod_1.z.number().or(zod_1.z.string().transform(v => Number(v))).optional().nullable(),
});
exports.campaignMembers = (0, pg_core_1.pgTable)("crm_campaign_members", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    campaignId: (0, pg_core_1.varchar)("campaign_id").references(() => exports.campaigns.id).notNull(),
    leadId: (0, pg_core_1.varchar)("lead_id").references(() => exports.leads.id),
    contactId: (0, pg_core_1.varchar)("contact_id").references(() => exports.contacts.id),
    status: (0, pg_core_1.varchar)("status").default("Sent"), // Sent, Responded, Connected
    responseDate: (0, pg_core_1.timestamp)("response_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertCampaignMemberSchema = (0, drizzle_zod_1.createInsertSchema)(exports.campaignMembers).extend({
    campaignId: zod_1.z.string().min(1),
    status: zod_1.z.string().optional(),
});
// --- Opportunities (Deals) ---
exports.opportunities = (0, pg_core_1.pgTable)("opportunities", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    accountId: (0, pg_core_1.varchar)("account_id"),
    type: (0, pg_core_1.varchar)("type"), // New Business, existing business, etc.
    leadSource: (0, pg_core_1.varchar)("lead_source"),
    amount: (0, pg_core_1.numeric)("amount").notNull(),
    closeDate: (0, pg_core_1.timestamp)("close_date"),
    stage: (0, pg_core_1.varchar)("stage").notNull(),
    nextStep: (0, pg_core_1.varchar)("next_step"),
    probability: (0, pg_core_1.integer)("probability"), // 0-100
    forecastCategory: (0, pg_core_1.varchar)("forecast_category"), // Pipeline, Best Case, Commit, Closed
    description: (0, pg_core_1.text)("description"),
    contactId: (0, pg_core_1.varchar)("contact_id"),
    campaignId: (0, pg_core_1.varchar)("campaign_id"),
    priceBookId: (0, pg_core_1.varchar)("price_book_id"), // Link to Price Book
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
    ownerId: (0, pg_core_1.varchar)("owner_id"),
});
exports.insertOpportunitySchema = (0, drizzle_zod_1.createInsertSchema)(exports.opportunities).extend({
    name: zod_1.z.string().min(1, "Opportunity name is required"),
    amount: zod_1.z.number().or(zod_1.z.string().transform(v => Number(v))).optional().nullable().default(0),
    probability: zod_1.z.number().or(zod_1.z.string().transform(v => Number(v))).optional().nullable(),
    closeDate: zod_1.z.coerce.date().optional().nullable(),
    priceBookId: zod_1.z.string().optional().nullable(),
});
// --- Interactions (Activities) ---
exports.interactions = (0, pg_core_1.pgTable)("interactions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    entityType: (0, pg_core_1.varchar)("entity_type").notNull(), // lead, contact, account, opportunity
    entityId: (0, pg_core_1.varchar)("entity_id").notNull(),
    type: (0, pg_core_1.varchar)("type").notNull(), // call, email, meeting, note
    subject: (0, pg_core_1.varchar)("subject"),
    summary: (0, pg_core_1.text)("summary").notNull(), // Keep for backward compat or use as 'description'
    description: (0, pg_core_1.text)("description"),
    priority: (0, pg_core_1.varchar)("priority").default("Normal"),
    status: (0, pg_core_1.varchar)("status").default("Completed"), // Not Started, In Progress, Completed
    dueDate: (0, pg_core_1.timestamp)("due_date"),
    performedAt: (0, pg_core_1.timestamp)("performed_at").default((0, drizzle_orm_1.sql) `now()`),
    performedBy: (0, pg_core_1.varchar)("performed_by"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertInteractionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.interactions).extend({
    summary: zod_1.z.string().min(1, "Summary/Subject is required"),
    type: zod_1.z.enum(["call", "email", "meeting", "note", "task"]),
    dueDate: zod_1.z.coerce.date().optional().nullable(),
    performedAt: zod_1.z.coerce.date().optional().nullable(),
});
// --- Products & CPQ ---
exports.products = (0, pg_core_1.pgTable)("crm_products", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    productCode: (0, pg_core_1.varchar)("product_code"),
    description: (0, pg_core_1.text)("description"),
    isActive: (0, pg_core_1.integer)("is_active").default(1), // 1=Active, 0=Inactive
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.priceBooks = (0, pg_core_1.pgTable)("crm_price_books", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    isActive: (0, pg_core_1.integer)("is_active").default(1),
    isStandard: (0, pg_core_1.integer)("is_standard").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.priceBookEntries = (0, pg_core_1.pgTable)("crm_price_book_entries", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    priceBookId: (0, pg_core_1.varchar)("price_book_id").notNull(),
    productId: (0, pg_core_1.varchar)("product_id").notNull(),
    unitPrice: (0, pg_core_1.numeric)("unit_price").notNull(),
    isActive: (0, pg_core_1.integer)("is_active").default(1),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.opportunityLineItems = (0, pg_core_1.pgTable)('crm_opportunity_line_items', {
    id: (0, pg_core_1.varchar)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    opportunityId: (0, pg_core_1.varchar)('opportunity_id').references(() => exports.opportunities.id).notNull(),
    productId: (0, pg_core_1.varchar)('product_id').references(() => exports.products.id), // Change from uuid to varchar to match products.id
    priceBookEntryId: (0, pg_core_1.varchar)('price_book_entry_id'), // Change from uuid to varchar to match priceBookEntries.id
    quantity: (0, pg_core_1.integer)('quantity').notNull().default(1),
    unitPrice: (0, pg_core_1.numeric)('unit_price').notNull(),
    totalPrice: (0, pg_core_1.numeric)('total_price'), // Computed
    description: (0, pg_core_1.text)('description'),
    createdAt: (0, pg_core_1.timestamp)('created_at').default((0, drizzle_orm_1.sql) `now()`),
});
// Quotes
exports.quotes = (0, pg_core_1.pgTable)('crm_quotes', {
    id: (0, pg_core_1.varchar)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    opportunityId: (0, pg_core_1.varchar)('opportunity_id').references(() => exports.opportunities.id), // Can be standalone
    name: (0, pg_core_1.text)('name').notNull(),
    quoteNumber: (0, pg_core_1.text)('quote_number'), // Auto-gen preferred
    expirationDate: (0, pg_core_1.timestamp)('expiration_date'),
    status: (0, pg_core_1.text)('status').default('Draft'), // Draft, Presented, Accepted, Rejected
    totalAmount: (0, pg_core_1.numeric)('total_amount').default('0'),
    description: (0, pg_core_1.text)('description'),
    billToName: (0, pg_core_1.text)('bill_to_name'),
    billToStreet: (0, pg_core_1.text)('bill_to_street'),
    billToCity: (0, pg_core_1.text)('bill_to_city'),
    billToState: (0, pg_core_1.text)('bill_to_state'),
    billToZip: (0, pg_core_1.text)('bill_to_zip'),
    billToCountry: (0, pg_core_1.text)('bill_to_country'),
    createdAt: (0, pg_core_1.timestamp)('created_at').default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').default((0, drizzle_orm_1.sql) `now()`),
    priceBookId: (0, pg_core_1.varchar)('price_book_id'), // CPQ Support
});
exports.quoteLineItems = (0, pg_core_1.pgTable)('crm_quote_line_items', {
    id: (0, pg_core_1.varchar)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    quoteId: (0, pg_core_1.varchar)('quote_id').references(() => exports.quotes.id).notNull(),
    productId: (0, pg_core_1.varchar)('product_id').references(() => exports.products.id),
    quantity: (0, pg_core_1.integer)('quantity').notNull().default(1),
    unitPrice: (0, pg_core_1.numeric)('unit_price').notNull(),
    totalPrice: (0, pg_core_1.numeric)('total_price'),
    description: (0, pg_core_1.text)('description'),
    priceBookEntryId: (0, pg_core_1.varchar)('price_book_entry_id'), // CPQ Support
    createdAt: (0, pg_core_1.timestamp)('created_at').default((0, drizzle_orm_1.sql) `now()`),
});
exports.orders = (0, pg_core_1.pgTable)('crm_orders', {
    id: (0, pg_core_1.varchar)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    accountId: (0, pg_core_1.varchar)('account_id').references(() => exports.accounts.id),
    quoteId: (0, pg_core_1.varchar)('quote_id').references(() => exports.quotes.id),
    opportunityId: (0, pg_core_1.varchar)('opportunity_id').references(() => exports.opportunities.id),
    orderNumber: (0, pg_core_1.text)('order_number'),
    status: (0, pg_core_1.text)('status').default('Draft'), // Draft, Activated, Fulfilled, Cancelled
    totalAmount: (0, pg_core_1.numeric)('total_amount').default('0'),
    effectiveDate: (0, pg_core_1.timestamp)('effective_date').default((0, drizzle_orm_1.sql) `now()`),
    billingAddress: (0, pg_core_1.text)('billing_address'),
    shippingAddress: (0, pg_core_1.text)('shipping_address'),
    createdAt: (0, pg_core_1.timestamp)('created_at').default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').default((0, drizzle_orm_1.sql) `now()`),
});
// Cases (Service Cloud)
exports.cases = (0, pg_core_1.pgTable)('crm_cases', {
    id: (0, pg_core_1.varchar)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    subject: (0, pg_core_1.text)('subject').notNull(),
    description: (0, pg_core_1.text)('description'),
    status: (0, pg_core_1.text)('status').default('New'), // New, Open, Closed
    priority: (0, pg_core_1.text)('priority').default('Medium'), // Low, Medium, High
    origin: (0, pg_core_1.text)('origin'), // Email, Phone, Web
    accountId: (0, pg_core_1.varchar)('account_id').references(() => exports.accounts.id),
    contactId: (0, pg_core_1.varchar)('contact_id').references(() => exports.contacts.id),
    userId: (0, pg_core_1.text)('user_id'), // Assigned User (legacy text id for now)
    createdAt: (0, pg_core_1.timestamp)('created_at').default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').default((0, drizzle_orm_1.sql) `now()`),
});
exports.caseComments = (0, pg_core_1.pgTable)('crm_case_comments', {
    id: (0, pg_core_1.varchar)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    caseId: (0, pg_core_1.varchar)('case_id').references(() => exports.cases.id).notNull(),
    body: (0, pg_core_1.text)('body').notNull(),
    isPublic: (0, pg_core_1.boolean)('is_public').default(false),
    createdById: (0, pg_core_1.text)('created_by_id'), // User ID
    createdAt: (0, pg_core_1.timestamp)('created_at').default((0, drizzle_orm_1.sql) `now()`),
});
// Field Service (Phase 26)
exports.serviceWorkOrders = (0, pg_core_1.pgTable)('crm_service_work_orders', {
    id: (0, pg_core_1.varchar)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    workOrderNumber: (0, pg_core_1.text)('work_order_number'), // Auto-gen
    caseId: (0, pg_core_1.varchar)('case_id').references(() => exports.cases.id),
    accountId: (0, pg_core_1.varchar)('account_id').references(() => exports.accounts.id),
    contactId: (0, pg_core_1.varchar)('contact_id').references(() => exports.contacts.id),
    subject: (0, pg_core_1.text)('subject').notNull(),
    description: (0, pg_core_1.text)('description'),
    status: (0, pg_core_1.text)('status').default('New'), // New, Scheduled, In Progress, Completed, Canceled
    priority: (0, pg_core_1.text)('priority').default('Medium'),
    street: (0, pg_core_1.text)('street'),
    city: (0, pg_core_1.text)('city'),
    state: (0, pg_core_1.text)('state'),
    postalCode: (0, pg_core_1.text)('postal_code'),
    country: (0, pg_core_1.text)('country'),
    createdAt: (0, pg_core_1.timestamp)('created_at').default((0, drizzle_orm_1.sql) `now()`),
});
exports.serviceAppointments = (0, pg_core_1.pgTable)('crm_service_appointments', {
    id: (0, pg_core_1.varchar)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    workOrderId: (0, pg_core_1.varchar)('work_order_id').references(() => exports.serviceWorkOrders.id).notNull(),
    technicianId: (0, pg_core_1.text)('technician_id'), // User ID
    scheduledStart: (0, pg_core_1.timestamp)('scheduled_start'),
    scheduledEnd: (0, pg_core_1.timestamp)('scheduled_end'),
    actualStart: (0, pg_core_1.timestamp)('actual_start'),
    actualEnd: (0, pg_core_1.timestamp)('actual_end'),
    status: (0, pg_core_1.text)('status').default('None'), // None, Scheduled, Dispatched, In Progress, Completed
    createdAt: (0, pg_core_1.timestamp)('created_at').default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertServiceWorkOrderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.serviceWorkOrders).extend({
    subject: zod_1.z.string().min(1, "Subject is required"),
});
exports.insertServiceAppointmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.serviceAppointments).extend({
    workOrderId: zod_1.z.string().min(1),
    scheduledStart: zod_1.z.coerce.date().optional(),
    scheduledEnd: zod_1.z.coerce.date().optional(),
});
// Knowledge Base (Phase 27)
exports.knowledgeArticles = (0, pg_core_1.pgTable)('crm_knowledge_articles', {
    id: (0, pg_core_1.varchar)('id').primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    title: (0, pg_core_1.text)('title').notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    category: (0, pg_core_1.text)('category'), // e.g., Technical, Billing, General
    status: (0, pg_core_1.text)('status').default('Draft'), // Draft, Published, Archived
    tags: (0, pg_core_1.text)('tags').array(),
    authorId: (0, pg_core_1.text)('author_id'), // User ID
    createdAt: (0, pg_core_1.timestamp)('created_at').default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertKnowledgeArticleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.knowledgeArticles).extend({
    title: zod_1.z.string().min(1, "Title is required"),
    content: zod_1.z.string().min(1, "Content is required"),
});
// APIs
exports.insertProductSchema = (0, drizzle_zod_1.createInsertSchema)(exports.products).extend({
    name: zod_1.z.string().min(1, "Product name is required"),
});
exports.insertPriceBookSchema = (0, drizzle_zod_1.createInsertSchema)(exports.priceBooks).extend({
    name: zod_1.z.string().min(1, "Price Book name is required"),
});
exports.insertPriceBookEntrySchema = (0, drizzle_zod_1.createInsertSchema)(exports.priceBookEntries).extend({
    unitPrice: zod_1.z.number().or(zod_1.z.string().transform(v => Number(v))),
});
exports.insertLineItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.opportunityLineItems).extend({
    quantity: zod_1.z.number().min(1),
    unitPrice: zod_1.z.number().or(zod_1.z.string().transform(v => Number(v))),
    totalPrice: zod_1.z.number().or(zod_1.z.string().transform(v => Number(v))).optional(), // Computed
});
exports.insertQuoteSchema = (0, drizzle_zod_1.createInsertSchema)(exports.quotes).extend({
    name: zod_1.z.string().min(1, "Quote name is required"),
    expirationDate: zod_1.z.string().optional().nullable().transform(val => val ? new Date(val) : null),
    totalAmount: zod_1.z.number().or(zod_1.z.string().transform(v => Number(v))).optional(),
    priceBookId: zod_1.z.string().optional().nullable(),
});
exports.insertQuoteLineItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.quoteLineItems).extend({
    quantity: zod_1.z.number().min(1),
    unitPrice: zod_1.z.number().or(zod_1.z.string().transform(v => Number(v))),
    totalPrice: zod_1.z.number().or(zod_1.z.string().transform(v => Number(v))).optional(),
    priceBookEntryId: zod_1.z.string().optional().nullable(),
});
exports.insertOrderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.orders).extend({
    effectiveDate: zod_1.z.string().optional().nullable().transform(val => val ? new Date(val) : null),
    totalAmount: zod_1.z.number().or(zod_1.z.string().transform(v => Number(v))).optional(),
});
exports.insertCaseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.cases).extend({
    subject: zod_1.z.string().min(1, "Subject is required"),
    priority: zod_1.z.enum(["Low", "Medium", "High"]).default("Medium"),
    status: zod_1.z.enum(["New", "Open", "Closed"]).default("New"),
});
exports.insertCaseCommentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.caseComments).extend({
    body: zod_1.z.string().min(1, "Comment body is required"),
});
// --- Approvals (Workflow) ---
exports.approvalRequests = (0, pg_core_1.pgTable)("crm_approval_requests", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    entityType: (0, pg_core_1.varchar)("entity_type").notNull(), // quote, opportunity, discount
    entityId: (0, pg_core_1.varchar)("entity_id").notNull(),
    requesterId: (0, pg_core_1.varchar)("requester_id").notNull(), // user_id
    approverId: (0, pg_core_1.varchar)("approver_id"), // user_id (optional, if assigned)
    status: (0, pg_core_1.varchar)("status").default("Pending"), // Pending, Approved, Rejected
    reason: (0, pg_core_1.text)("reason"), // Justification for request
    comments: (0, pg_core_1.text)("comments"), // Approver comments
    requestedAt: (0, pg_core_1.timestamp)("requested_at").default((0, drizzle_orm_1.sql) `now()`),
    respondedAt: (0, pg_core_1.timestamp)("responded_at"),
});
exports.insertApprovalRequestSchema = (0, drizzle_zod_1.createInsertSchema)(exports.approvalRequests).extend({
    entityType: zod_1.z.string().min(1),
    entityId: zod_1.z.string().min(1),
    requesterId: zod_1.z.string().min(1),
    reason: zod_1.z.string().optional(),
});
// --- Sales Quotas (Phase 21) ---
exports.salesQuotas = (0, pg_core_1.pgTable)("crm_quotas", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull(), // Assigned Rep
    periodName: (0, pg_core_1.varchar)("period_name").notNull(), // e.g. "Q1-2026", "Jan-2026"
    quotaAmount: (0, pg_core_1.numeric)("quota_amount").notNull().default("0"),
    currencyCode: (0, pg_core_1.varchar)("currency_code").default("USD"),
    targetType: (0, pg_core_1.varchar)("target_type").default("Revenue"), // Revenue, Deal Count, Activity
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertSalesQuotaSchema = (0, drizzle_zod_1.createInsertSchema)(exports.salesQuotas).extend({
    quotaAmount: zod_1.z.number().or(zod_1.z.string().transform(v => Number(v))),
});
// --- Competitor Intelligence (Phase 21) ---
exports.competitors = (0, pg_core_1.pgTable)("crm_competitors", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull().unique(),
    website: (0, pg_core_1.varchar)("website"),
    strengths: (0, pg_core_1.text)("strengths"),
    weaknesses: (0, pg_core_1.text)("weaknesses"),
    threatLevel: (0, pg_core_1.varchar)("threat_level").default("Medium"), // Low, Medium, High
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.opportunityCompetitors = (0, pg_core_1.pgTable)("crm_opportunity_competitors", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    opportunityId: (0, pg_core_1.varchar)("opportunity_id").references(() => exports.opportunities.id).notNull(),
    competitorId: (0, pg_core_1.varchar)("competitor_id").references(() => exports.competitors.id).notNull(),
    status: (0, pg_core_1.varchar)("status").default("Active"), // Active, Winning, Lost To
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertCompetitorSchema = (0, drizzle_zod_1.createInsertSchema)(exports.competitors).extend({
    name: zod_1.z.string().min(1, "Competitor Name is required"),
});
exports.insertOpportunityCompetitorSchema = (0, drizzle_zod_1.createInsertSchema)(exports.opportunityCompetitors);
// --- Territory Management (Phase 21.3) ---
exports.territories = (0, pg_core_1.pgTable)("crm_territories", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    parentId: (0, pg_core_1.varchar)("parent_id"), // Self-referencing FK logic handled in app
    ownerId: (0, pg_core_1.varchar)("owner_id"), // Sales Rep assigned to this territory
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.territoryRules = (0, pg_core_1.pgTable)("crm_territory_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    territoryId: (0, pg_core_1.varchar)("territory_id").references(() => exports.territories.id).notNull(),
    priority: (0, pg_core_1.integer)("priority").default(1),
    field: (0, pg_core_1.varchar)("field").notNull(), // e.g., "billingState", "industry", "annualRevenue"
    operator: (0, pg_core_1.varchar)("operator").notNull(), // "equals", "contains", "gt", "lt"
    value: (0, pg_core_1.varchar)("value").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertTerritorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.territories).extend({
    name: zod_1.z.string().min(1, "Territory Name is required"),
});
exports.insertTerritoryRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.territoryRules).extend({
    field: zod_1.z.string().min(1),
    operator: zod_1.z.enum(["equals", "contains", "gt", "lt"]),
    value: zod_1.z.string().min(1),
});
// --- Incentive Compensation (Phase 22) ---
exports.commissionPlans = (0, pg_core_1.pgTable)("crm_commission_plans", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    type: (0, pg_core_1.varchar)("type").notNull().default("flat_rate"), // "flat_rate", "percentage_deal_value", "percentage_profit"
    rate: (0, pg_core_1.numeric)("rate").notNull(), // e.g. 5.0 for 5%, or 500 for $500
    quotaThreshold: (0, pg_core_1.numeric)("quota_threshold"), // Optional: Only pay if quota > X%
    customFormula: (0, pg_core_1.text)("custom_formula"), // For complex logic
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// Link Users to Plans
exports.commissionAssignments = (0, pg_core_1.pgTable)("crm_commission_assignments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull(), // Linking to users.id
    planId: (0, pg_core_1.varchar)("plan_id").references(() => exports.commissionPlans.id).notNull(),
    effectiveDate: (0, pg_core_1.timestamp)("effective_date").default((0, drizzle_orm_1.sql) `now()`),
});
exports.commissions = (0, pg_core_1.pgTable)("crm_commissions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    opportunityId: (0, pg_core_1.varchar)("opportunity_id").references(() => exports.opportunities.id).notNull(),
    userId: (0, pg_core_1.varchar)("user_id").notNull(), // Sales Rep
    planId: (0, pg_core_1.varchar)("plan_id").references(() => exports.commissionPlans.id),
    baseAmount: (0, pg_core_1.numeric)("base_amount").notNull(), // The deal value used
    commissionAmount: (0, pg_core_1.numeric)("commission_amount").notNull(), // The calculated payout
    status: (0, pg_core_1.varchar)("status").default("pending"), // pending, approved, paid
    generatedAt: (0, pg_core_1.timestamp)("generated_at").default((0, drizzle_orm_1.sql) `now()`),
    paidAt: (0, pg_core_1.timestamp)("paid_at"),
});
exports.insertCommissionPlanSchema = (0, drizzle_zod_1.createInsertSchema)(exports.commissionPlans).extend({
    name: zod_1.z.string().min(1),
    rate: zod_1.z.number().or(zod_1.z.string()),
});
exports.insertCommissionAssignmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.commissionAssignments);
exports.insertCommissionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.commissions);
//# sourceMappingURL=crm.js.map