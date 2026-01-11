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
  cashStatementLines as cashStatementLinesTable,
  cashStatementHeaders as cashStatementHeadersTable,
  cashTransactions as cashTransactionsTable,
  cashReconciliationRules as cashReconciliationRulesTable,
  cashMatchingGroups as cashMatchingGroupsTable,
  cashBankAccounts as cashBankAccountsTable,
  glJournalApprovals as glJournalApprovalsTable,
  arInvoices as arInvoicesTable,
  arReceipts as arReceiptsTable,
  arCustomers as arCustomersTable,
  apSuppliers as apSuppliersTable,
  apInvoices as apInvoicesTable,
  apPayments as apPaymentsTable,
  apApprovals as apApprovalsTable,
  type GlSegmentValue,
  type InsertGlSegmentValue,
  type GlCodeCombination,
  type InsertGlCodeCombination,
  type GlDailyRate,
  type InsertGlDailyRate,
  type InsertGlJournalBatch,
  type InsertGlJournalApproval,
  type GlJournalBatch,
  type GlJournalApproval,
  arSystemOptions as arSystemOptionsTable
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
  // AP Module
  ApApproval,
  InsertApApproval,
  // AR Module
  ArCustomer,
  InsertArCustomer,
  ArInvoice,
  InsertArInvoice,
  ArReceipt,
  InsertArReceipt,
  ApSupplier,
  InsertApSupplier,
  ApInvoice,
  InsertApInvoice,
  ApPayment,
  InsertApPayment,
  GlLedger,
  InsertGlLedger,
  GlSegment,
  InsertGlSegment,
  CashStatementLine, InsertCashStatementLine,
  CashStatementHeader, InsertCashStatementHeader,
  CashTransaction, InsertCashTransaction,
  CashReconciliationRule, InsertCashReconciliationRule,
  CashMatchingGroup, InsertCashMatchingGroup,
  CashBankAccount, InsertCashBankAccount,
  ArSystemOptions, InsertArSystemOptions
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

  // ========== ACCOUNTS PAYABLE ==========
  async listApSuppliers(): Promise<ApSupplier[]> {
    return await db.select().from(apSuppliersTable);
  },
  async getApSupplier(id: string): Promise<ApSupplier | undefined> {
    const result = await db.select().from(apSuppliersTable).where(eq(apSuppliersTable.id, parseInt(id))).limit(1);
    return result[0];
  },
  async createApSupplier(data: InsertApSupplier): Promise<ApSupplier> {
    const result = await db.insert(apSuppliersTable).values(data).returning();
    return result[0];
  },
  async updateApSupplier(id: string, data: Partial<InsertApSupplier>): Promise<ApSupplier | undefined> {
    const result = await db.update(apSuppliersTable).set(data).where(eq(apSuppliersTable.id, parseInt(id))).returning();
    return result[0];
  },
  async deleteApSupplier(id: string): Promise<boolean> {
    const result = await db.delete(apSuppliersTable).where(eq(apSuppliersTable.id, parseInt(id))).returning();
    return result.length > 0;
  },

  async listApInvoices(): Promise<ApInvoice[]> {
    return await db.select().from(apInvoicesTable);
  },
  async getApInvoice(id: string): Promise<ApInvoice | undefined> {
    const result = await db.select().from(apInvoicesTable).where(eq(apInvoicesTable.id, parseInt(id))).limit(1);
    return result[0];
  },
  async createApInvoice(data: InsertApInvoice): Promise<ApInvoice> {
    const result = await db.insert(apInvoicesTable).values(data).returning();
    return result[0];
  },
  async updateApInvoice(id: string, data: Partial<InsertApInvoice>): Promise<ApInvoice | undefined> {
    const result = await db.update(apInvoicesTable).set(data).where(eq(apInvoicesTable.id, parseInt(id))).returning();
    return result[0];
  },
  async deleteApInvoice(id: string): Promise<boolean> {
    const result = await db.delete(apInvoicesTable).where(eq(apInvoicesTable.id, parseInt(id))).returning();
    return result.length > 0;
  },

  async listApPayments(): Promise<ApPayment[]> {
    return await db.select().from(apPaymentsTable);
  },
  async getApPayment(id: string): Promise<ApPayment | undefined> {
    const result = await db.select().from(apPaymentsTable).where(eq(apPaymentsTable.id, parseInt(id))).limit(1);
    return result[0];
  },
  async createApPayment(data: InsertApPayment): Promise<ApPayment> {
    const result = await db.insert(apPaymentsTable).values(data).returning();
    return result[0];
  },
  async updateApPayment(id: string, data: Partial<InsertApPayment>): Promise<ApPayment | undefined> {
    const result = await db.update(apPaymentsTable).set(data).where(eq(apPaymentsTable.id, parseInt(id))).returning();
    return result[0];
  },
  async deleteApPayment(id: string): Promise<boolean> {
    const result = await db.delete(apPaymentsTable).where(eq(apPaymentsTable.id, parseInt(id))).returning();
    return result.length > 0;
  },

  async listApApprovals(): Promise<ApApproval[]> {
    return await db.select().from(apApprovalsTable);
  },
  async getApApproval(id: string): Promise<ApApproval | undefined> {
    const result = await db.select().from(apApprovalsTable).where(eq(apApprovalsTable.id, parseInt(id))).limit(1);
    return result[0];
  },
  async createApApproval(data: InsertApApproval): Promise<ApApproval> {
    const result = await db.insert(apApprovalsTable).values(data).returning();
    return result[0];
  },
  async updateApApproval(id: string, data: Partial<InsertApApproval>): Promise<ApApproval | undefined> {
    const result = await db.update(apApprovalsTable).set(data).where(eq(apApprovalsTable.id, parseInt(id))).returning();
    return result[0];
  },
  async deleteApApproval(id: string): Promise<boolean> {
    const result = await db.delete(apApprovalsTable).where(eq(apApprovalsTable.id, parseInt(id))).returning();
    return result.length > 0;
  },

  // ========== ACCOUNTS RECEIVABLE ==========
  async listArCustomers(): Promise<ArCustomer[]> {
    return await db.select().from(arCustomersTable);
  },
  async getArCustomer(id: string): Promise<ArCustomer | undefined> {
    const result = await db.select().from(arCustomersTable).where(eq(arCustomersTable.id, id)).limit(1);
    return result[0];
  },
  async createArCustomer(data: InsertArCustomer): Promise<ArCustomer> {
    const result = await db.insert(arCustomersTable).values(data).returning();
    return result[0];
  },
  async updateArCustomer(id: string, data: Partial<InsertArCustomer>): Promise<ArCustomer | undefined> {
    const result = await db.update(arCustomersTable).set(data).where(eq(arCustomersTable.id, id)).returning();
    return result[0];
  },
  async deleteArCustomer(id: string): Promise<boolean> {
    const result = await db.delete(arCustomersTable).where(eq(arCustomersTable.id, id)).returning();
    return result.length > 0;
  },

  async listArInvoices(): Promise<ArInvoice[]> {
    return await db.select().from(arInvoicesTable);
  },
  async getArInvoice(id: string): Promise<ArInvoice | undefined> {
    const result = await db.select().from(arInvoicesTable).where(eq(arInvoicesTable.id, id)).limit(1);
    return result[0];
  },
  async createArInvoice(data: InsertArInvoice): Promise<ArInvoice> {
    const result = await db.insert(arInvoicesTable).values(data).returning();
    return result[0];
  },
  async updateArInvoice(id: string, data: Partial<InsertArInvoice>): Promise<ArInvoice | undefined> {
    const result = await db.update(arInvoicesTable).set(data).where(eq(arInvoicesTable.id, id)).returning();
    return result[0];
  },
  async deleteArInvoice(id: string): Promise<boolean> {
    const result = await db.delete(arInvoicesTable).where(eq(arInvoicesTable.id, id)).returning();
    return result.length > 0;
  },

  async listArReceipts(): Promise<ArReceipt[]> {
    return await db.select().from(arReceiptsTable);
  },
  async getArReceipt(id: string): Promise<ArReceipt | undefined> {
    const result = await db.select().from(arReceiptsTable).where(eq(arReceiptsTable.id, id)).limit(1);
    return result[0];
  },
  async createArReceipt(data: InsertArReceipt): Promise<ArReceipt> {
    const result = await db.insert(arReceiptsTable).values(data).returning();
    return result[0];
  },
  async updateArReceipt(id: string, data: Partial<InsertArReceipt>): Promise<ArReceipt | undefined> {
    const result = await db.update(arReceiptsTable).set(data).where(eq(arReceiptsTable.id, id)).returning();
    return result[0];
  },
  async deleteArReceipt(id: string): Promise<boolean> {
    const result = await db.delete(arReceiptsTable).where(eq(arReceiptsTable.id, id)).returning();
    return result.length > 0;
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
    const [ledger] = await db.select().from(glLedgersTable).where(eq(glLedgersTable.id, ledgerId));
    if (!ledger || !ledger.coaId) return [];
    return await db.select().from(glSegmentsTable).where(eq(glSegmentsTable.coaStructureId, ledger.coaId));
  },
  async createGlSegment(segment: InsertGlSegment): Promise<GlSegment> {
    const result = await db.insert(glSegmentsTable).values(segment).returning();
    return result[0];
  },

  async listGlSegmentValues(segmentId: string): Promise<GlSegmentValue[]> {
    const [segment] = await db.select().from(glSegmentsTable).where(eq(glSegmentsTable.id, segmentId));
    if (!segment) return [];
    return await db.select().from(glSegmentValuesTable).where(eq(glSegmentValuesTable.valueSetId, segment.valueSetId));
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

  // ========== CASH MANAGEMENT (CHUNK 4 & 5) ==========
  async listCashBankAccounts(): Promise<CashBankAccount[]> {
    return await db.select().from(cashBankAccountsTable);
  },
  async getCashBankAccount(id: string): Promise<CashBankAccount | undefined> {
    const [account] = await db.select().from(cashBankAccountsTable).where(eq(cashBankAccountsTable.id, id));
    return account;
  },
  async createCashBankAccount(data: InsertCashBankAccount): Promise<CashBankAccount> {
    const [account] = await db.insert(cashBankAccountsTable).values(data).returning();
    return account;
  },
  async updateCashBankAccount(id: string, data: Partial<InsertCashBankAccount>): Promise<CashBankAccount | undefined> {
    const [updated] = await db.update(cashBankAccountsTable).set(data).where(eq(cashBankAccountsTable.id, id)).returning();
    return updated;
  },
  async deleteCashBankAccount(id: string): Promise<boolean> {
    const [deleted] = await db.delete(cashBankAccountsTable).where(eq(cashBankAccountsTable.id, id)).returning();
    return !!deleted;
  },

  // Headers
  async listCashStatementHeaders(bankAccountId: string): Promise<CashStatementHeader[]> {
    return await db.select().from(cashStatementHeadersTable).where(eq(cashStatementHeadersTable.bankAccountId, bankAccountId)).orderBy(desc(cashStatementHeadersTable.statementDate));
  },
  async createCashStatementHeader(data: InsertCashStatementHeader): Promise<CashStatementHeader> {
    const [header] = await db.insert(cashStatementHeadersTable).values(data).returning();
    return header;
  },
  async updateCashStatementHeader(id: string, data: Partial<InsertCashStatementHeader>): Promise<CashStatementHeader> {
    const [updated] = await db.update(cashStatementHeadersTable).set(data).where(eq(cashStatementHeadersTable.id, id)).returning();
    return updated;
  },

  // Lines
  async listCashStatementLines(bankAccountId: string): Promise<CashStatementLine[]> {
    return await db.select().from(cashStatementLinesTable).where(eq(cashStatementLinesTable.bankAccountId, bankAccountId)).orderBy(desc(cashStatementLinesTable.transactionDate));
  },
  async createCashStatementLine(data: InsertCashStatementLine): Promise<CashStatementLine> {
    const [line] = await db.insert(cashStatementLinesTable).values(data).returning();
    return line;
  },

  // Transactions
  async listCashTransactions(bankAccountId: string): Promise<CashTransaction[]> {
    return await db.select().from(cashTransactionsTable).where(eq(cashTransactionsTable.bankAccountId, bankAccountId)).orderBy(desc(cashTransactionsTable.transactionDate));
  },
  async createCashTransaction(data: InsertCashTransaction): Promise<CashTransaction> {
    const [txn] = await db.insert(cashTransactionsTable).values(data).returning();
    return txn;
  },
  async updateCashTransaction(id: string, data: Partial<InsertCashTransaction>): Promise<CashTransaction> {
    const [updated] = await db.update(cashTransactionsTable).set(data).where(eq(cashTransactionsTable.id, id)).returning();
    return updated;
  },

  // Rules
  async listCashReconciliationRules(ledgerId: string): Promise<CashReconciliationRule[]> {
    return await db.select().from(cashReconciliationRulesTable).where(eq(cashReconciliationRulesTable.ledgerId, ledgerId));
  },
  async createCashReconciliationRule(data: InsertCashReconciliationRule): Promise<CashReconciliationRule> {
    const [rule] = await db.insert(cashReconciliationRulesTable).values(data).returning();
    return rule;
  },
  async createCashMatchingGroup(data: InsertCashMatchingGroup): Promise<CashMatchingGroup> {
    const [group] = await db.insert(cashMatchingGroupsTable).values(data).returning();
    return group;
  },

  // Fsg (Placeholder implementations to satisfy interface)
  async listFsgRowSets(ledgerId: string): Promise<any[]> { return []; },
  async getFsgRowSet(id: string): Promise<any> { return undefined; },
  async createFsgRowSet(data: any): Promise<any> { return {}; },
  async listFsgColumnSets(ledgerId: string): Promise<any[]> { return []; },
  async getFsgColumnSet(id: string): Promise<any> { return undefined; },
  async createFsgColumnSet(data: any): Promise<any> { return {}; },

  // AR System Options
  async getArSystemOptions(ledgerId: string): Promise<ArSystemOptions | undefined> {
    const [options] = await db.select().from(arSystemOptionsTable).where(eq(arSystemOptionsTable.ledgerId, ledgerId));
    return options;
  },
  async upsertArSystemOptions(data: InsertArSystemOptions): Promise<ArSystemOptions> {
    const [existing] = await db.select().from(arSystemOptionsTable).where(eq(arSystemOptionsTable.ledgerId, data.ledgerId));
    if (existing) {
      const [updated] = await db.update(arSystemOptionsTable).set({ ...data, updatedAt: new Date() }).where(eq(arSystemOptionsTable.id, existing.id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(arSystemOptionsTable).values(data).returning();
      return created;
    }
  },
};
