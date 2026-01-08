/**
 * Database-backed storage implementation
 * Replaces in-memory stores with persistent PostgreSQL storage
 */

import { db } from "./db";
// duplicate import removed
import { eq, and, sql, desc } from "drizzle-orm";
import {
  invoices as invoicesTable,
  leads as leadsTable,
  workOrders as workOrdersTable,
  employees as employeesTable,
  copilotConversations as conversationsTable,
  copilotMessages as messagesTable,
  demos as demosTable,
  users as usersTable,
  projects as projectsTable,
  tenants as tenantsTable,
  accounts as accountsTable,
  contacts as contactsTable,
  opportunities as opportunitiesTable,
  interactions as interactionsTable,
  campaigns as campaignsTable,
  products as productsTable,
  priceBooks as priceBooksTable,
  priceBookEntries as priceBookEntriesTable,
  opportunityLineItems as opportunityLineItemsTable,
  quotes as quotesTable,
  quoteLineItems as quoteLineItemsTable,
  orders as ordersTable,
  cases as casesTable,
  caseComments as caseCommentsTable,
  glLedgers as glLedgersTable,
  glSegments as glSegmentsTable,
  glSegmentValues as glSegmentValuesTable,
  glCodeCombinations as glCodeCombinationsTable,
  glDailyRates as glDailyRatesTable,
  glJournalBatches as glJournalBatchesTable,
  glJournalApprovals as glJournalApprovalsTable,
  type InsertGlJournalBatch,
  type InsertGlJournalApproval,
  type GlJournalBatch,
  type GlJournalApproval
} from "@shared/schema";
import type {
  Campaign,
  InsertCampaign,
  Invoice,
  InsertInvoice,
  Lead,
  InsertLead,
  Account,
  InsertAccount,
  Contact,
  InsertContact,
  Opportunity,
  InsertOpportunity,
  Interaction,
  InsertInteraction,
  WorkOrder,
  InsertWorkOrder,
  Employee,
  InsertEmployee,
  CopilotConversation,
  InsertCopilotConversation,
  CopilotMessage,
  InsertCopilotMessage,
  Demo,
  InsertDemo,
  User,
  InsertUser,
  Project,
  InsertProject,
  Tenant,
  InsertProduct,
  Product,
  InsertPriceBook,
  PriceBook,
  InsertPriceBookEntry,
  PriceBookEntry,
  InsertOpportunityLineItem,
  OpportunityLineItem,
  Quote,
  InsertQuote,
  QuoteLineItem,
  InsertQuoteLineItem,
  Order,
  InsertOrder,
  Case,
  InsertCase,
  CaseComment,
  InsertCaseComment,
} from "@shared/schema";

/**
 * Database storage operations for Phase 2
 * Implements CRUD operations using Drizzle ORM with PostgreSQL
 */
export const dbStorage = {
  // ========== INVOICES ==========
  async getInvoice(id: string): Promise<Invoice | undefined> {
    const result = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, id))
      .limit(1);
    return result[0];
  },

  async listInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoicesTable);
  },

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const result = await db
      .insert(invoicesTable)
      .values(invoice)
      .returning();
    return result[0];
  },

  async updateInvoice(
    id: string,
    invoice: Partial<InsertInvoice>
  ): Promise<Invoice | undefined> {
    const result = await db
      .update(invoicesTable)
      .set(invoice)
      .where(eq(invoicesTable.id, id))
      .returning();
    return result[0];
  },

  // ========== LEADS ==========
  async getLead(id: string): Promise<Lead | undefined> {
    const result = await db
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.id, id))
      .limit(1);
    return result[0];
  },

  async listLeads(): Promise<Lead[]> {
    return await db.select().from(leadsTable);
  },

  async createLead(lead: InsertLead): Promise<Lead> {
    const result = await db
      .insert(leadsTable)
      .values({
        ...lead,
        annualRevenue: lead.annualRevenue ? String(lead.annualRevenue) : null,
      })
      .returning();
    return result[0];
  },

  // ========== ACCOUNTS (CRM) ==========
  async getAccount(id: string): Promise<Account | undefined> {
    const result = await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.id, id))
      .limit(1);
    return result[0];
  },

  async listAccounts(): Promise<Account[]> {
    return await db.select().from(accountsTable);
  },

  async createAccount(account: InsertAccount): Promise<Account> {
    const result = await db
      .insert(accountsTable)
      .values({
        ...account,
        annualRevenue: account.annualRevenue ? String(account.annualRevenue) : null,
      })
      .returning();
    return result[0];
  },

  // ========== CONTACTS (CRM) ==========
  async listContacts(accountId?: string): Promise<Contact[]> {
    if (accountId) {
      return await db
        .select()
        .from(contactsTable)
        .where(eq(contactsTable.accountId, accountId));
    }
    return await db.select().from(contactsTable);
  },

  async createContact(contact: InsertContact): Promise<Contact> {
    const result = await db
      .insert(contactsTable)
      .values(contact)
      .returning();
    return result[0];
  },

  // ========== OPPORTUNITIES (CRM) ==========
  async getOpportunity(id: string): Promise<Opportunity | undefined> {
    const result = await db
      .select()
      .from(opportunitiesTable)
      .where(eq(opportunitiesTable.id, id))
      .limit(1);
    return result[0];
  },

  async listOpportunities(): Promise<Opportunity[]> {
    return await db.select().from(opportunitiesTable);
  },

  async createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity> {
    const result = await db
      .insert(opportunitiesTable)
      .values({
        ...opportunity,
        amount: String(opportunity.amount)
      })
      .returning();
    return result[0];
  },

  async updateOpportunity(id: string, updates: Partial<InsertOpportunity>): Promise<Opportunity | undefined> {
    const updateData: any = { ...updates };
    if (updateData.amount !== undefined) {
      updateData.amount = String(updateData.amount);
    }

    const result = await db
      .update(opportunitiesTable)
      .set(updateData)
      .where(eq(opportunitiesTable.id, id))
      .returning();
    return result[0];
  },

  // ========== CAMPAIGNS ==========
  async listCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaignsTable);
  },

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const result = await db
      .insert(campaignsTable)
      .values({
        ...campaign,
        expectedRevenue: campaign.expectedRevenue ? String(campaign.expectedRevenue) : null,
        budgetedCost: campaign.budgetedCost ? String(campaign.budgetedCost) : null,
        actualCost: campaign.actualCost ? String(campaign.actualCost) : null,
      })
      .returning();
    return result[0];
  },

  async updateCampaign(id: string, updates: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const updateData: any = { ...updates };
    if (updateData.expectedRevenue !== undefined) updateData.expectedRevenue = String(updateData.expectedRevenue);
    if (updateData.budgetedCost !== undefined) updateData.budgetedCost = String(updateData.budgetedCost);
    if (updateData.actualCost !== undefined) updateData.actualCost = String(updateData.actualCost);

    const result = await db
      .update(campaignsTable)
      .set(updateData)
      .where(eq(campaignsTable.id, id))
      .returning();
    return result[0];
  },

  async deleteCampaign(id: string): Promise<boolean> {
    const result = await db
      .delete(campaignsTable)
      .where(eq(campaignsTable.id, id))
      .returning();
    return result.length > 0;
  },

  // ========== PRODUCTS & PRICE BOOKS ==========

  async listProducts(): Promise<Product[]> {
    return await db.select().from(productsTable);
  },

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db
      .insert(productsTable)
      .values(product)
      .returning();
    return result[0];
  },

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db
      .update(productsTable)
      .set(product)
      .where(eq(productsTable.id, id))
      .returning();
    return result[0];
  },

  async listPriceBooks(): Promise<PriceBook[]> {
    return await db.select().from(priceBooksTable);
  },

  async createPriceBook(pb: InsertPriceBook): Promise<PriceBook> {
    const result = await db
      .insert(priceBooksTable)
      .values(pb)
      .returning();
    return result[0];
  },

  async listPriceBookEntries(priceBookId: string): Promise<PriceBookEntry[]> {
    return await db
      .select()
      .from(priceBookEntriesTable)
      .where(eq(priceBookEntriesTable.priceBookId, priceBookId));
  },

  async createPriceBookEntry(entry: InsertPriceBookEntry): Promise<PriceBookEntry> {
    const result = await db
      .insert(priceBookEntriesTable)
      .values({
        ...entry,
        unitPrice: String(entry.unitPrice), // Ensure string for numeric
      })
      .returning();
    return result[0];
  },

  // ========== OPPORTUNITY LINE ITEMS ==========

  async listOpportunityLineItems(opportunityId: string): Promise<OpportunityLineItem[]> {
    return await db
      .select()
      .from(opportunityLineItemsTable)
      .where(eq(opportunityLineItemsTable.opportunityId, opportunityId));
  },

  async createOpportunityLineItem(item: InsertOpportunityLineItem): Promise<OpportunityLineItem> {
    const unitPrice = Number(item.unitPrice);
    const quantity = item.quantity;
    const totalPrice = item.totalPrice ? Number(item.totalPrice) : unitPrice * quantity;

    const result = await db
      .insert(opportunityLineItemsTable)
      .values({
        ...item,
        unitPrice: String(unitPrice),
        totalPrice: String(totalPrice),
      })
      .returning();

    // Recalculate Opportunity Amount
    const items = await this.listOpportunityLineItems(item.opportunityId);
    const totalAmount = items.reduce((sum, i) => sum + Number(i.totalPrice), 0);

    await db
      .update(opportunitiesTable)
      .set({ amount: String(totalAmount) })
      .where(eq(opportunitiesTable.id, item.opportunityId));

    return result[0];
  },

  async deleteOpportunityLineItem(id: string): Promise<boolean> {
    // Get opportunityId first
    const [existing] = await db
      .select()
      .from(opportunityLineItemsTable)
      .where(eq(opportunityLineItemsTable.id, id));

    if (!existing) return false;

    const result = await db
      .delete(opportunityLineItemsTable)
      .where(eq(opportunityLineItemsTable.id, id))
      .returning();

    // Recalculate Opportunity Amount
    const items = await this.listOpportunityLineItems(existing.opportunityId);
    const totalAmount = items.reduce((sum, i) => sum + Number(i.totalPrice), 0);

    await db
      .update(opportunitiesTable)
      .set({ amount: String(totalAmount) })
      .where(eq(opportunitiesTable.id, existing.opportunityId));

    return result.length > 0;
  },

  // ========== QUOTES ==========
  async listQuotes(opportunityId?: string): Promise<Quote[]> {
    if (opportunityId) {
      return await db
        .select()
        .from(quotesTable)
        .where(eq(quotesTable.opportunityId, opportunityId));
    }
    return await db.select().from(quotesTable);
  },

  async getQuote(id: string): Promise<Quote | undefined> {
    const result = await db
      .select()
      .from(quotesTable)
      .where(eq(quotesTable.id, id))
      .limit(1);
    return result[0];
  },

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const result = await db
      .insert(quotesTable)
      .values({
        ...quote,
        totalAmount: quote.totalAmount ? String(quote.totalAmount) : '0'
      })
      .returning();
    return result[0];
  },

  async listQuoteLineItems(quoteId: string): Promise<QuoteLineItem[]> {
    return await db
      .select()
      .from(quoteLineItemsTable)
      .where(eq(quoteLineItemsTable.quoteId, quoteId));
  },

  async createQuoteLineItem(item: InsertQuoteLineItem): Promise<QuoteLineItem> {
    const unitPrice = Number(item.unitPrice);
    const quantity = item.quantity;
    const totalPrice = item.totalPrice ? Number(item.totalPrice) : unitPrice * quantity;

    const result = await db
      .insert(quoteLineItemsTable)
      .values({
        ...item,
        unitPrice: String(unitPrice),
        totalPrice: String(totalPrice),
      })
      .returning();

    // Recalculate Quote Amount
    const items = await this.listQuoteLineItems(item.quoteId);
    const totalAmount = items.reduce((sum, i) => sum + Number(i.totalPrice), 0);

    await db
      .update(quotesTable)
      .set({ totalAmount: String(totalAmount) })
      .where(eq(quotesTable.id, item.quoteId));

    return result[0];
  },

  // ========== ORDERS ==========
  async listOrders(): Promise<Order[]> {
    return await db.select().from(ordersTable);
  },

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db
      .insert(ordersTable)
      .values({
        ...order,
        totalAmount: order.totalAmount ? String(order.totalAmount) : '0'
      })
      .returning();
    return result[0];
  },

  // ========== CASES (SERVICE) ==========
  async listCases(options?: { accountId?: string; contactId?: string }): Promise<Case[]> {
    if (options?.accountId) {
      return await db.select().from(casesTable).where(eq(casesTable.accountId, options.accountId));
    }
    if (options?.contactId) {
      return await db.select().from(casesTable).where(eq(casesTable.contactId, options.contactId));
    }
    return await db.select().from(casesTable);
  },

  async getCase(id: string): Promise<Case | undefined> {
    const result = await db
      .select()
      .from(casesTable)
      .where(eq(casesTable.id, id))
      .limit(1);
    return result[0];
  },

  async createCase(data: InsertCase): Promise<Case> {
    const result = await db.insert(casesTable).values(data).returning();
    return result[0];
  },

  async updateCase(id: string, data: InsertCase): Promise<Case | undefined> {
    const result = await db
      .update(casesTable)
      .set(data)
      .where(eq(casesTable.id, id))
      .returning();
    return result[0];
  },

  async listCaseComments(caseId: string): Promise<CaseComment[]> {
    return await db
      .select()
      .from(caseCommentsTable)
      .where(eq(caseCommentsTable.caseId, caseId));
  },

  async createCaseComment(data: InsertCaseComment): Promise<CaseComment> {
    const result = await db.insert(caseCommentsTable).values(data).returning();
    return result[0];
  },

  // ========== INTERACTIONS (CRM) ==========
  async listInteractions(entityType: string, entityId: string): Promise<Interaction[]> {
    return await db
      .select()
      .from(interactionsTable)
      .where(and(eq(interactionsTable.entityType, entityType), eq(interactionsTable.entityId, entityId)));
  },

  async createInteraction(interaction: InsertInteraction): Promise<Interaction> {
    const result = await db
      .insert(interactionsTable)
      .values(interaction)
      .returning();
    return result[0];
  },

  async updateLead(
    id: string,
    lead: Partial<InsertLead>
  ): Promise<Lead | undefined> {
    const updateData: any = { ...lead };
    if (updateData.annualRevenue !== undefined) {
      updateData.annualRevenue = updateData.annualRevenue ? String(updateData.annualRevenue) : null;
    }

    const result = await db
      .update(leadsTable)
      .set(updateData)
      .where(eq(leadsTable.id, id))
      .returning();
    return result[0];
  },

  async convertLead(leadId: string, ownerId?: string): Promise<{ account: Account; contact: Contact; opportunity: Opportunity }> {
    return await db.transaction(async (tx) => {
      const [lead] = await tx.select().from(leadsTable).where(eq(leadsTable.id, leadId));
      if (!lead) throw new Error("Lead not found");
      if (lead.isConverted) throw new Error("Lead already converted");

      // 1. Create Account
      const [account] = await tx.insert(accountsTable).values({
        name: lead.company || `${lead.firstName} ${lead.lastName}`,
        industry: lead.industry,
        phone: lead.phone,
        billingCity: lead.city,
        billingState: lead.state,
        billingCountry: lead.country,
        ownerId: ownerId || lead.ownerId
      }).returning();

      // 2. Create Contact
      const [contact] = await tx.insert(contactsTable).values({
        accountId: account.id,
        firstName: lead.firstName || "",
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        mobilePhone: lead.mobilePhone,
        mailingCity: lead.city,
        mailingState: lead.state,
        mailingCountry: lead.country,
        ownerId: ownerId || lead.ownerId,
        leadSource: lead.leadSource
      }).returning();

      // 3. Create Opportunity
      const [opportunity] = await tx.insert(opportunitiesTable).values({
        accountId: account.id,
        contactId: contact.id, // Primary contact
        name: `${account.name} - Opportunity`,
        stage: "Prospecting",
        amount: "0", // Default
        closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
        leadSource: lead.leadSource,
        ownerId: ownerId || lead.ownerId
      }).returning();

      // 4. Update Lead
      await tx.update(leadsTable).set({
        isConverted: 1,
        convertedDate: new Date(),
        convertedAccountId: account.id,
        convertedContactId: contact.id,
        convertedOpportunityId: opportunity.id,
        status: "Converted"
      }).where(eq(leadsTable.id, leadId));

      return { account, contact, opportunity };
    });
  },

  // ========== ANALYTICS ==========
  async getPipelineMetrics() {
    const result = await db
      .select({
        stage: opportunitiesTable.stage,
        count: sql<number>`count(*)`,
        value: sql<number>`sum(cast(${opportunitiesTable.amount} as numeric))`
      })
      .from(opportunitiesTable)
      .groupBy(opportunitiesTable.stage);

    return result.map(r => ({
      stage: r.stage || "Unknown",
      count: Number(r.count),
      value: Number(r.value || 0)
    }));
  },

  async getRevenueMetrics() {
    // Group by month of closed-won opportunities
    const result = await db
      .select({
        month: sql<string>`to_char(${opportunitiesTable.closeDate}, 'YYYY-MM')`,
        value: sql<number>`sum(cast(${opportunitiesTable.amount} as numeric))`
      })
      .from(opportunitiesTable)
      .where(eq(opportunitiesTable.stage, 'closed-won'))
      .groupBy(sql`to_char(${opportunitiesTable.closeDate}, 'YYYY-MM')`)
      .orderBy(desc(sql`to_char(${opportunitiesTable.closeDate}, 'YYYY-MM')`))
      .limit(12);

    return result.map(r => ({
      month: r.month,
      value: Number(r.value || 0)
    })).reverse();
  },

  async getLeadSourceMetrics() {
    const result = await db
      .select({
        source: leadsTable.leadSource,
        count: sql<number>`count(*)`
      })
      .from(leadsTable)
      .groupBy(leadsTable.leadSource);

    return result.map(r => ({
      source: r.source || "Unknown",
      count: Number(r.count)
    }));
  },

  async getCaseMetrics() {
    const result = await db
      .select({
        status: casesTable.status,
        priority: casesTable.priority,
        count: sql<number>`count(*)`
      })
      .from(casesTable)
      .groupBy(casesTable.status, casesTable.priority);

    return result.map(r => ({
      status: r.status || "Unknown",
      priority: r.priority || "Unknown",
      count: Number(r.count)
    }));
  },

  // ========== WORK ORDERS ==========
  async createWorkOrder(order: InsertWorkOrder): Promise<WorkOrder> {
    const result = await db
      .insert(workOrdersTable)
      .values(order)
      .returning();
    return result[0];
  },

  // ========== EMPLOYEES ==========
  async getEmployee(id: string): Promise<Employee | undefined> {
    const result = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.id, id))
      .limit(1);
    return result[0];
  },

  async listEmployees(): Promise<Employee[]> {
    return await db.select().from(employeesTable);
  },

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const result = await db
      .insert(employeesTable)
      .values(employee)
      .returning();
    return result[0];
  },

  // ========== COPILOT ==========
  async getCopilotConversation(id: string): Promise<CopilotConversation | undefined> {
    const result = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, id))
      .limit(1);
    return result[0];
  },

  async listCopilotConversations(): Promise<CopilotConversation[]> {
    return await db.select().from(conversationsTable);
  },

  async createCopilotConversation(
    conv: InsertCopilotConversation
  ): Promise<CopilotConversation> {
    const result = await db
      .insert(conversationsTable)
      .values(conv)
      .returning();
    return result[0];
  },

  async getCopilotMessage(id: string): Promise<CopilotMessage | undefined> {
    const result = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.id, id))
      .limit(1);
    return result[0];
  },

  async listCopilotMessages(conversationId?: string): Promise<CopilotMessage[]> {
    if (conversationId) {
      return await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.conversationId, conversationId));
    }
    return await db.select().from(messagesTable);
  },

  async createCopilotMessage(msg: InsertCopilotMessage): Promise<CopilotMessage> {
    const result = await db
      .insert(messagesTable)
      .values(msg)
      .returning();
    return result[0];
  },

  // ========== DEMOS ==========
  async getDemo(id: string): Promise<Demo | undefined> {
    const result = await db
      .select()
      .from(demosTable)
      .where(eq(demosTable.id, id))
      .limit(1);
    return result[0];
  },

  async listDemos(): Promise<Demo[]> {
    return await db.select().from(demosTable);
  },

  async createDemo(demo: InsertDemo): Promise<Demo> {
    const result = await db
      .insert(demosTable)
      .values(demo)
      .returning();
    return result[0];
  },

  async updateDemo(id: string, demo: Partial<InsertDemo>): Promise<Demo | undefined> {
    const result = await db
      .update(demosTable)
      .set(demo)
      .where(eq(demosTable.id, id))
      .returning();
    return result[0];
  },

  async deleteDemo(id: string): Promise<boolean> {
    await db.delete(demosTable).where(eq(demosTable.id, id));
    return true;
  },

  // ========== USERS ==========
  async getUser(id: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    return result[0];
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);
    return result[0];
  },

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(usersTable).values(user).returning();
    return result[0];
  },

  // ========== ADVANCED GL (PHASE 2) ==========

  async getGlLedger(id: string): Promise<GlLedger | undefined> {
    const result = await db.select().from(glLedgersTable).where(eq(glLedgersTable.id, id)).limit(1);
    return result[0];
  },
  async listGlLedgers(): Promise<GlLedger[]> {
    return await db.select().from(glLedgersTable);
  },
  async createGlLedger(ledger: InsertGlLedger): Promise<GlLedger> {
    const result = await db.insert(glLedgersTable).values(ledger).returning();
    return result[0];
  },

  async listGlSegments(ledgerId: string): Promise<GlSegment[]> {
    return await db.select().from(glSegmentsTable).where(eq(glSegmentsTable.ledgerId, ledgerId));
  },
  async createGlSegment(segment: InsertGlSegment): Promise<GlSegment> {
    const result = await db.insert(glSegmentsTable).values(segment).returning();
    return result[0];
  },

  async listGlSegmentValues(segmentId: string): Promise<GlSegmentValue[]> {
    return await db.select().from(glSegmentValuesTable).where(eq(glSegmentValuesTable.segmentId, segmentId));
  },
  async createGlSegmentValue(val: InsertGlSegmentValue): Promise<GlSegmentValue> {
    const result = await db.insert(glSegmentValuesTable).values(val).returning();
    return result[0];
  },

  async getGlCodeCombination(id: string): Promise<GlCodeCombination | undefined> {
    const result = await db.select().from(glCodeCombinationsTable).where(eq(glCodeCombinationsTable.id, id)).limit(1);
    return result[0];
  },
  async createGlCodeCombination(cc: InsertGlCodeCombination): Promise<GlCodeCombination> {
    const result = await db.insert(glCodeCombinationsTable).values(cc).returning();
    return result[0];
  },

  async listGlDailyRates(from: string, to: string, date: Date): Promise<GlDailyRate[]> {
    return await db.select().from(glDailyRatesTable).where(
      and(eq(glDailyRatesTable.fromCurrency, from), eq(glDailyRatesTable.toCurrency, to))
    );
  },
  async createGlDailyRate(rate: InsertGlDailyRate): Promise<GlDailyRate> {
    const result = await db.insert(glDailyRatesTable).values({
      ...rate,
      rate: String(rate.rate)
    }).returning();
    return result[0];
  },

  // ========== ADVANCED GL (PHASE 2 - JOURNALS) ==========

  async createGlJournalBatch(batch: InsertGlJournalBatch): Promise<GlJournalBatch> {
    const result = await db.insert(glJournalBatchesTable).values(batch).returning();
    return result[0];
  },
  async getGlJournalBatch(id: string): Promise<GlJournalBatch | undefined> {
    const result = await db.select().from(glJournalBatchesTable).where(eq(glJournalBatchesTable.id, id)).limit(1);
    return result[0];
  },
  async listGlJournalBatches(): Promise<GlJournalBatch[]> {
    return await db.select().from(glJournalBatchesTable);
  },
  async updateGlJournalBatch(id: string, batch: Partial<InsertGlJournalBatch>): Promise<GlJournalBatch | undefined> {
    const result = await db.update(glJournalBatchesTable).set(batch).where(eq(glJournalBatchesTable.id, id)).returning();
    return result[0];
  },

  async createGlJournalApproval(approval: InsertGlJournalApproval): Promise<GlJournalApproval> {
    const result = await db.insert(glJournalApprovalsTable).values(approval).returning();
    return result[0];
  },
  async listGlJournalApprovals(journalId: string): Promise<GlJournalApproval[]> {
    return await db.select().from(glJournalApprovalsTable).where(eq(glJournalApprovalsTable.journalId, journalId));
  },
  async updateGlJournalApproval(id: string, approval: Partial<InsertGlJournalApproval>): Promise<GlJournalApproval | undefined> {
    const result = await db.update(glJournalApprovalsTable).set(approval).where(eq(glJournalApprovalsTable.id, id)).returning();
    return result[0];
  },

  async listUsers(): Promise<User[]> {
    return await db.select().from(usersTable);
  },

  async createUser(user: InsertUser): Promise<User> {
    const result = await db
      .insert(usersTable)
      .values(user)
      .returning();
    return result[0];
  },

  // ========== PROJECTS ==========
  async getProject(id: string): Promise<Project | undefined> {
    const result = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id))
      .limit(1);
    return result[0];
  },

  async listProjects(): Promise<Project[]> {
    return await db.select().from(projectsTable);
  },

  async createProject(project: InsertProject): Promise<Project> {
    const result = await db
      .insert(projectsTable)
      .values(project)
      .returning();
    return result[0];
  },

  // ========== TENANTS ==========
  async listTenants(): Promise<Tenant[]> {
    return await db.select().from(tenantsTable);
  },
};
