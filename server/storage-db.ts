/**
 * Database-backed storage implementation
 * Replaces in-memory stores with persistent PostgreSQL storage
 */

import { db } from "./db";
// duplicate import removed
import { eq, and, sql, desc, count } from "drizzle-orm";
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
  glJournalApprovals as glJournalApprovalsTable,
  arInvoices as arInvoicesTable,
  arInvoiceLines as arInvoiceLinesTable,
  arReceipts as arReceiptsTable,
  arCustomers as arCustomersTable,
  arCustomerAccounts as arCustomerAccountsTable,
  arCustomerSites as arCustomerSitesTable,
  arCustomerContacts as arCustomerContactsTable,
  apSuppliers as apSuppliersTable,
  apInvoices as apInvoicesTable,
  apPayments as apPaymentsTable,
  apApprovals as apApprovalsTable,
  apPaymentTerms as apPaymentTermsTable,
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
  arSystemOptions as arSystemOptionsTable,
  arDocumentSequences as arDocumentSequencesTable,
  arDocumentSequenceAssignments as arDocumentSequenceAssignmentsTable,
  glAutoPostRules as glAutoPostRulesTable,
  glDataAccessSets as glDataAccessSetsTable,
  expenseReports as expenseReportsTable,
  expenseLines as expenseLinesTable,
  expensePolicies as expensePoliciesTable,
  expensePerDiems as expensePerDiemsTable,
  corporateCardTransactions as corporateCardTransactionsTable,
  type ExpenseReport,
  type InsertExpenseReport,
  type ExpenseLine,
  type InsertExpenseLine,
  type ExpensePolicy,
  type InsertExpensePolicy,
  type ExpensePerDiem,
  type InsertExpensePerDiem,
  type CorporateCardTransaction,
  type InsertCorporateCardTransaction,
  type GlAutoPostRule,
  type InsertGlAutoPostRule,
  type GlDataAccessSet,
  type InsertGlDataAccessSet,
  glLedgerRelationships as glLedgerRelationshipsTable,
  glLedgerRelationships,
  type GlLedgerRelationship,
  type InsertGlLedgerRelationship
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
  ArCustomerAccount,
  InsertArCustomerAccount,
  ArCustomerSite,
  InsertArCustomerSite,
  ArCustomerContact,
  InsertArCustomerContact,
  ArInvoice,
  InsertArInvoice,
  ArInvoiceLine,
  InsertArInvoiceLine,
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
  ArSystemOptions, InsertArSystemOptions,
  ArDocumentSequence, InsertArDocumentSequence,
  ArDocumentSequenceAssignment, InsertArDocumentSequenceAssignment
} from "@shared/schema";
import { revenueService } from "./modules/revenue/services/RevenueService";
import { partyService } from "./services/PartyService";


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
    // 1. Create Organization Party
    const { party } = await partyService.createOrganization(
      {
        partyName: account.name,
        partyNumber: `ACCT-${Date.now().toString().slice(-9)}-${Math.floor(Math.random() * 1000)}`,
        partyType: 'ORGANIZATION'
      },
      {
        organizationName: account.name,
        industryCode: account.industry
      }
    );

    // 2. Create Account Linked to Party
    const result = await db
      .insert(accountsTable)
      .values({
        ...account,
        annualRevenue: account.annualRevenue ? String(account.annualRevenue) : null,
        partyId: party.id // TCA Linkage
      })
      .returning();
    return result[0];
  },

  // ========== LEDGER RELATIONSHIPS ==========
  async listLedgerRelationships(): Promise<GlLedgerRelationship[]> {
    return await db.select().from(glLedgerRelationships);
  },

  async createLedgerRelationship(data: InsertGlLedgerRelationship): Promise<GlLedgerRelationship> {
    const result = await db
      .insert(glLedgerRelationships)
      .values(data)
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
    // 1. Create Person Party
    const { party } = await partyService.createPerson(
      {
        partyName: `${contact.firstName} ${contact.lastName}`,
        partyNumber: `CONT-${Date.now().toString().slice(-9)}-${Math.floor(Math.random() * 1000)}`,
        email: contact.email,
        partyType: 'PERSON'
      },
      {
        personFirstName: contact.firstName,
        personLastName: contact.lastName
      }
    );

    // 2. Create Contact Linked to Party
    const result = await db
      .insert(contactsTable)
      .values({
        ...contact,
        partyId: party.id // TCA Linkage
      })
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

  async listOpportunities(accountId?: string): Promise<Opportunity[]> {
    if (accountId) {
      return await db.select().from(opportunitiesTable).where(eq(opportunitiesTable.accountId, accountId));
    }
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

    // Hook: Revenue Management (ASC 606)
    if (result[0] && order.accountId) {
      try {
        await revenueService.processSourceEvent({
          sourceSystem: "OrderManagement",
          sourceId: result[0].id,
          eventType: "Booking",
          customerId: order.accountId, // Using Account as Customer Proxy
          ledgerId: "1", // Default Ledger for now
          amount: Number(result[0].totalAmount || 0),
          currency: "USD",
          eventDate: result[0].effectiveDate || new Date(),
          relatedContractId: undefined
        });
      } catch (err) {
        console.error("Failed to process revenue event for order:", result[0].id, err);
        // Don't block order creation
      }
    }

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

      // 1. Create Account (with Party)
      // Note: We duplicate logic here because we are in a transaction block
      // Ideally call PartyService here too (will be separate transaction context, but acceptable for now)

      const { party: accountParty } = await partyService.createOrganization(
        {
          partyName: lead.company || `${lead.firstName} ${lead.lastName}`,
          partyNumber: `ACCT-${Date.now().toString().slice(-8)}-${lead.id.substring(0, 4)}`,
          partyType: 'ORGANIZATION'
        },
        {
          organizationName: lead.company || `${lead.firstName} ${lead.lastName}`,
          industryCode: lead.industry
        }
      );

      const [account] = await tx.insert(accountsTable).values({
        name: lead.company || `${lead.firstName} ${lead.lastName}`,
        industry: lead.industry,
        phone: lead.phone,
        billingCity: lead.city,
        billingState: lead.state,
        billingCountry: lead.country,
        ownerId: ownerId || lead.ownerId,
        partyId: accountParty.id // TCA Linkage
      }).returning();

      // 2. Create Contact (with Party)
      const { party: contactParty } = await partyService.createPerson(
        {
          partyName: `${lead.firstName} ${lead.lastName}`,
          partyNumber: `CONT-${Date.now().toString().slice(-8)}-${lead.id.substring(0, 4)}`,
          email: lead.email,
          partyType: 'PERSON'
        },
        {
          personFirstName: lead.firstName || "",
          personLastName: lead.lastName
        }
      );

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
        leadSource: lead.leadSource,
        partyId: contactParty.id // TCA Linkage
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
  async listApPaymentTerms(): Promise<ApPaymentTerm[]> {
    return await db.select().from(apPaymentTermsTable).orderBy(apPaymentTermsTable.termName);
  },
  async getApPaymentTerm(id: string): Promise<ApPaymentTerm | undefined> {
    const result = await db.select().from(apPaymentTermsTable).where(eq(apPaymentTermsTable.id, id)).limit(1);
    return result[0];
  },
  async createApPaymentTerm(data: InsertApPaymentTerm): Promise<ApPaymentTerm> {
    const result = await db.insert(apPaymentTermsTable).values(data).returning();
    return result[0];
  },
  async updateApPaymentTerm(id: string, data: Partial<InsertApPaymentTerm>): Promise<ApPaymentTerm | undefined> {
    const result = await db.update(apPaymentTermsTable).set(data).where(eq(apPaymentTermsTable.id, id)).returning();
    return result[0];
  },

  async listApSuppliers(): Promise<ApSupplier[]> {
    return await db.select().from(apSuppliersTable);
  },
  async getApSupplier(id: string): Promise<ApSupplier | undefined> {
    const result = await db.select().from(apSuppliersTable).where(eq(apSuppliersTable.id, id)).limit(1);
    return result[0];
  },
  async createApSupplier(data: InsertApSupplier): Promise<ApSupplier> {
    const result = await db.insert(apSuppliersTable).values(data).returning();
    return result[0];
  },
  async updateApSupplier(id: string, data: Partial<InsertApSupplier>): Promise<ApSupplier | undefined> {
    const result = await db.update(apSuppliersTable).set(data).where(eq(apSuppliersTable.id, id)).returning();
    return result[0];
  },
  async deleteApSupplier(id: string): Promise<boolean> {
    const result = await db.delete(apSuppliersTable).where(eq(apSuppliersTable.id, id)).returning();
    return result.length > 0;
  },

  async listApInvoices(options?: {
    limit?: number;
    offset?: number;
    status?: string | "all";
    validationStatus?: string | "all";
    entBusinessUnitId?: string;
    filters?: Record<string, any>;
  }): Promise<any[]> {
    const conditions = [];
    if (options?.status && options.status !== "all") {
      conditions.push(sql`lower(${apInvoicesTable.invoiceStatus}) = lower(${options.status})`);
    }
    if (options?.validationStatus && options.validationStatus !== "all") {
      conditions.push(sql`lower(${apInvoicesTable.validationStatus}) = lower(${options.validationStatus})`);
    }
    if (options?.entBusinessUnitId) {
      conditions.push(eq(apInvoicesTable.entBusinessUnitId, options.entBusinessUnitId));
    }

    if (options?.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (key === 'invoiceNumber') {
          conditions.push(sql`lower(${apInvoicesTable.invoiceNumber}) LIKE lower(${`%${value}%`})`);
        }
        else if (key === 'supplierId') {
          conditions.push(eq(apInvoicesTable.supplierId, value));
        }
        else if (key === 'businessUnitId') {
          conditions.push(eq(apInvoicesTable.businessUnitId, value));
        }
        else if (key === 'fromDate') {
          conditions.push(sql`${apInvoicesTable.invoiceDate} >= ${new Date(value).toISOString()}`);
        }
        else if (key === 'toDate') {
          conditions.push(sql`${apInvoicesTable.invoiceDate} <= ${new Date(value).toISOString()}`);
        }
      }
    }

    let query = db.select({
      invoice: apInvoicesTable,
      supplier: apSuppliersTable
    }).from(apInvoicesTable)
      .leftJoin(apSuppliersTable, eq(apInvoicesTable.supplierId, apSuppliersTable.id));

    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
    }

    // @ts-ignore
    query = query.orderBy(desc(apInvoicesTable.createdAt));

    if (options?.limit !== undefined) {
      // @ts-ignore
      query = query.limit(options.limit);
    }
    if (options?.offset !== undefined) {
      // @ts-ignore
      query = query.offset(options.offset);
    }

    const results = await query;
    return results.map(r => ({ ...r.invoice, supplier: r.supplier }));
  },
  async getApInvoicesCount(entBusinessUnitId?: string): Promise<number> {
    let query = db.select({ count: count() }).from(apInvoicesTable);
    if (entBusinessUnitId) {
      query = query.where(eq(apInvoicesTable.entBusinessUnitId, entBusinessUnitId)) as any;
    }
    const [res] = await query;
    return res.count;
  },
  async getApInvoice(id: string): Promise<ApInvoice | undefined> {
    const result = await db.select().from(apInvoicesTable).where(eq(apInvoicesTable.id, id)).limit(1);
    return result[0];
  },
  async createApInvoice(data: InsertApInvoice): Promise<ApInvoice> {
    const result = await db.insert(apInvoicesTable).values(data).returning();
    return result[0];
  },
  async updateApInvoice(id: string, data: Partial<InsertApInvoice>): Promise<ApInvoice | undefined> {
    const result = await db.update(apInvoicesTable).set(data).where(eq(apInvoicesTable.id, id)).returning();
    return result[0];
  },
  async deleteApInvoice(id: string): Promise<boolean> {
    const result = await db.delete(apInvoicesTable).where(eq(apInvoicesTable.id, id)).returning();
    return result.length > 0;
  },

  async listApPayments(options?: { entBusinessUnitId?: string }): Promise<ApPayment[]> {
    if (options?.entBusinessUnitId) {
      return await db.select().from(apPaymentsTable).where(eq(apPaymentsTable.entBusinessUnitId, options.entBusinessUnitId));
    }
    return await db.select().from(apPaymentsTable);
  },
  async getApPayment(id: string): Promise<ApPayment | undefined> {
    const result = await db.select().from(apPaymentsTable).where(eq(apPaymentsTable.id, id)).limit(1);
    return result[0];
  },
  async createApPayment(data: InsertApPayment): Promise<ApPayment> {
    const result = await db.insert(apPaymentsTable).values(data).returning();
    return result[0];
  },
  async updateApPayment(id: string, data: Partial<InsertApPayment>): Promise<ApPayment | undefined> {
    const result = await db.update(apPaymentsTable).set(data).where(eq(apPaymentsTable.id, id)).returning();
    return result[0];
  },
  async deleteApPayment(id: string): Promise<boolean> {
    const result = await db.delete(apPaymentsTable).where(eq(apPaymentsTable.id, id)).returning();
    return result.length > 0;
  },

  async listApApprovals(): Promise<ApApproval[]> {
    return await db.select().from(apApprovalsTable);
  },
  async getApApproval(id: string): Promise<ApApproval | undefined> {
    const result = await db.select().from(apApprovalsTable).where(eq(apApprovalsTable.id, id)).limit(1);
    return result[0];
  },
  async createApApproval(data: InsertApApproval): Promise<ApApproval> {
    const result = await db.insert(apApprovalsTable).values(data).returning();
    return result[0];
  },
  async updateApApproval(id: string, data: Partial<InsertApApproval>): Promise<ApApproval | undefined> {
    const result = await db.update(apApprovalsTable).set(data).where(eq(apApprovalsTable.id, id)).returning();
    return result[0];
  },
  async deleteApApproval(id: string): Promise<boolean> {
    const result = await db.delete(apApprovalsTable).where(eq(apApprovalsTable.id, id)).returning();
    return result.length > 0;
  },

  // ========== ORACLE PARITY: AP ENTERPRISE SETUP ==========
  async listApTolerances(): Promise<ApTolerance[]> {
    return await db.select().from(apTolerancesTable);
  },
  async getApTolerance(id: string): Promise<ApTolerance | undefined> {
    const result = await db.select().from(apTolerancesTable).where(eq(apTolerancesTable.id, id)).limit(1);
    return result[0];
  },
  async createApTolerance(data: InsertApTolerance): Promise<ApTolerance> {
    const result = await db.insert(apTolerancesTable).values(data).returning();
    return result[0];
  },
  async updateApTolerance(id: string, data: Partial<InsertApTolerance>): Promise<ApTolerance | undefined> {
    const result = await db.update(apTolerancesTable).set(data).where(eq(apTolerancesTable.id, id)).returning();
    return result[0];
  },
  async deleteApTolerance(id: string): Promise<boolean> {
    const result = await db.delete(apTolerancesTable).where(eq(apTolerancesTable.id, id)).returning();
    return result.length > 0;
  },

  async listApPprTemplates(): Promise<ApPprTemplate[]> {
    return await db.select().from(apPprTemplatesTable);
  },
  async getApPprTemplate(id: string): Promise<ApPprTemplate | undefined> {
    const result = await db.select().from(apPprTemplatesTable).where(eq(apPprTemplatesTable.id, id)).limit(1);
    return result[0];
  },
  async createApPprTemplate(data: InsertApPprTemplate): Promise<ApPprTemplate> {
    const result = await db.insert(apPprTemplatesTable).values(data).returning();
    return result[0];
  },
  async updateApPprTemplate(id: string, data: Partial<InsertApPprTemplate>): Promise<ApPprTemplate | undefined> {
    const result = await db.update(apPprTemplatesTable).set(data).where(eq(apPprTemplatesTable.id, id)).returning();
    return result[0];
  },
  async deleteApPprTemplate(id: string): Promise<boolean> {
    const result = await db.delete(apPprTemplatesTable).where(eq(apPprTemplatesTable.id, id)).returning();
    return result.length > 0;
  },

  // ========== ACCOUNTS RECEIVABLE ==========

  async listArInvoices(limit?: number, offset?: number, entBusinessUnitId?: string): Promise<ArInvoice[]> {
    let query = db.select().from(arInvoicesTable);
    if (entBusinessUnitId) {
      query = query.where(eq(arInvoicesTable.entBusinessUnitId, entBusinessUnitId)) as any;
    }
    query = query.orderBy(desc(arInvoicesTable.createdAt)) as any;
    if (limit !== undefined) query = query.limit(limit) as any;
    if (offset !== undefined) query = query.offset(offset) as any;
    return await query;
  },
  async getArInvoicesCount(entBusinessUnitId?: string): Promise<number> {
    let query = db.select({ count: count() }).from(arInvoicesTable);
    if (entBusinessUnitId) {
      query = query.where(eq(arInvoicesTable.entBusinessUnitId, entBusinessUnitId)) as any;
    }
    const [res] = await query;
    return res.count;
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

  async listArInvoiceLines(invoiceId: string): Promise<ArInvoiceLine[]> {
    return await db.select().from(arInvoiceLinesTable).where(eq(arInvoiceLinesTable.invoiceId, invoiceId)).orderBy(arInvoiceLinesTable.lineNumber);
  },
  async createArInvoiceLine(data: InsertArInvoiceLine): Promise<ArInvoiceLine> {
    const result = await db.insert(arInvoiceLinesTable).values(data).returning();
    return result[0];
  },
  async updateArInvoiceLine(id: string, data: Partial<InsertArInvoiceLine>): Promise<ArInvoiceLine | undefined> {
    const result = await db.update(arInvoiceLinesTable).set(data).where(eq(arInvoiceLinesTable.id, id)).returning();
    return result[0];
  },

  async listArReceipts(entBusinessUnitId?: string): Promise<ArReceipt[]> {
    let query = db.select().from(arReceiptsTable);
    if (entBusinessUnitId) {
      query = query.where(eq(arReceiptsTable.entBusinessUnitId, entBusinessUnitId)) as any;
    }
    query = query.orderBy(desc(arReceiptsTable.createdAt)) as any;
    return await query;
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

  // ========== AR CUSTOMERS (TCA) ==========
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

  // ========== AR CUSTOMER ACCOUNTS ==========
  async listArCustomerAccounts(customerId?: string): Promise<ArCustomerAccount[]> {
    if (customerId) {
      return await db.select().from(arCustomerAccountsTable).where(eq(arCustomerAccountsTable.customerId, customerId));
    }
    return await db.select().from(arCustomerAccountsTable);
  },
  async getArCustomerAccount(id: string): Promise<ArCustomerAccount | undefined> {
    const result = await db.select().from(arCustomerAccountsTable).where(eq(arCustomerAccountsTable.id, id)).limit(1);
    return result[0];
  },
  async createArCustomerAccount(data: InsertArCustomerAccount): Promise<ArCustomerAccount> {
    const result = await db.insert(arCustomerAccountsTable).values(data).returning();
    return result[0];
  },
  async updateArCustomerAccount(id: string, data: Partial<InsertArCustomerAccount>): Promise<ArCustomerAccount | undefined> {
    const result = await db.update(arCustomerAccountsTable).set(data).where(eq(arCustomerAccountsTable.id, id)).returning();
    return result[0];
  },

  // ========== AR CUSTOMER SITES ==========
  async listArCustomerSites(accountId: string): Promise<ArCustomerSite[]> {
    return await db.select().from(arCustomerSitesTable).where(eq(arCustomerSitesTable.accountId, accountId));
  },
  async getArCustomerSite(id: string): Promise<ArCustomerSite | undefined> {
    const result = await db.select().from(arCustomerSitesTable).where(eq(arCustomerSitesTable.id, id)).limit(1);
    return result[0];
  },
  async createArCustomerSite(data: InsertArCustomerSite): Promise<ArCustomerSite> {
    const result = await db.insert(arCustomerSitesTable).values(data).returning();
    return result[0];
  },
  async updateArCustomerSite(id: string, data: Partial<InsertArCustomerSite>): Promise<ArCustomerSite | undefined> {
    const result = await db.update(arCustomerSitesTable).set(data).where(eq(arCustomerSitesTable.id, id)).returning();
    return result[0];
  },

  // ========== AR CUSTOMER CONTACTS ==========
  async listArCustomerContacts(customerId: string): Promise<ArCustomerContact[]> {
    return await db.select().from(arCustomerContactsTable).where(eq(arCustomerContactsTable.customerId, customerId));
  },
  async getArCustomerContact(id: string): Promise<ArCustomerContact | undefined> {
    const result = await db.select().from(arCustomerContactsTable).where(eq(arCustomerContactsTable.id, id)).limit(1);
    return result[0];
  },
  async createArCustomerContact(data: InsertArCustomerContact): Promise<ArCustomerContact> {
    const result = await db.insert(arCustomerContactsTable).values(data).returning();
    return result[0];
  },
  async updateArCustomerContact(id: string, data: Partial<InsertArCustomerContact>): Promise<ArCustomerContact | undefined> {
    const result = await db.update(arCustomerContactsTable).set(data).where(eq(arCustomerContactsTable.id, id)).returning();
    return result[0];
  },
  async deleteArCustomerContact(id: string): Promise<boolean> {
    const result = await db.delete(arCustomerContactsTable).where(eq(arCustomerContactsTable.id, id)).returning();
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

  async getOrCreateCodeCombination(ledgerId: string, segments: string[]): Promise<GlCodeCombination> {
    const code = segments.join("-");
    const existing = await db.select().from(glCodeCombinationsTable).where(eq(glCodeCombinationsTable.code, code)).limit(1);
    if (existing[0]) return existing[0];

    const vals: any = {
      ledgerId,
      code,
      enabledFlag: true,
      startDateActive: new Date()
    };
    for (let i = 0; i < segments.length; i++) {
      if (i < 10) vals[`segment${i + 1}`] = segments[i];
    }

    const result = await db.insert(glCodeCombinationsTable).values(vals as InsertGlCodeCombination).returning();
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


  // ========== AUTOINVOICE STAGING ==========
  async listArAutoInvoiceStaging(status?: string): Promise<ArAutoInvoiceStaging[]> {
    if (status) {
      return await db.select().from(arAutoInvoiceStagingTable).where(eq(arAutoInvoiceStagingTable.status, status));
    }
    return await db.select().from(arAutoInvoiceStagingTable);
  },
  async getArAutoInvoiceStaging(id: string): Promise<ArAutoInvoiceStaging | undefined> {
    const result = await db.select().from(arAutoInvoiceStagingTable).where(eq(arAutoInvoiceStagingTable.id, id)).limit(1);
    return result[0];
  },
  async createArAutoInvoiceStaging(data: InsertArAutoInvoiceStaging): Promise<ArAutoInvoiceStaging> {
    const result = await db.insert(arAutoInvoiceStagingTable).values(data).returning();
    return result[0];
  },
  async updateArAutoInvoiceStaging(id: string, data: Partial<InsertArAutoInvoiceStaging>): Promise<ArAutoInvoiceStaging | undefined> {
    const result = await db.update(arAutoInvoiceStagingTable).set(data).where(eq(arAutoInvoiceStagingTable.id, id)).returning();
    return result[0];
  },
  async deleteArAutoInvoiceStaging(id: string): Promise<boolean> {
    const result = await db.delete(arAutoInvoiceStagingTable).where(eq(arAutoInvoiceStagingTable.id, id)).returning();
    return result.length > 0;
  },

  // ========== AUTOINVOICE ERRORS ==========
  async listArAutoInvoiceErrors(stagingId: string): Promise<ArAutoInvoiceError[]> {
    return await db.select().from(arAutoInvoiceErrorsTable).where(eq(arAutoInvoiceErrorsTable.stagingId, stagingId));
  },
  async createArAutoInvoiceError(data: InsertArAutoInvoiceError): Promise<ArAutoInvoiceError> {
    const result = await db.insert(arAutoInvoiceErrorsTable).values(data).returning();
    return result[0];
  },
  async deleteArAutoInvoiceErrors(stagingId: string): Promise<boolean> {
    const result = await db.delete(arAutoInvoiceErrorsTable).where(eq(arAutoInvoiceErrorsTable.stagingId, stagingId)).returning();
    return result.length > 0;
  },

  // ========== AR SALES CREDITS ==========
  async listArSalesCredits(invoiceLineId: string): Promise<ArSalesCredit[]> {
    return await db.select().from(arSalesCreditsTable).where(eq(arSalesCreditsTable.invoiceLineId, invoiceLineId));
  },
  async createArSalesCredit(data: InsertArSalesCredit): Promise<ArSalesCredit> {
    const result = await db.insert(arSalesCreditsTable).values(data).returning();
    return result[0];
  },
  async updateArSalesCredit(id: string, data: Partial<InsertArSalesCredit>): Promise<ArSalesCredit | undefined> {
    const result = await db.update(arSalesCreditsTable).set(data).where(eq(arSalesCreditsTable.id, id)).returning();
    return result[0];
  },
  async deleteArSalesCredit(id: string): Promise<boolean> {
    const result = await db.delete(arSalesCreditsTable).where(eq(arSalesCreditsTable.id, id)).returning();
    return result.length > 0;
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
  async listCashBankAccounts(entLegalEntityId?: string): Promise<CashBankAccount[]> {
    let query = db.select().from(cashBankAccountsTable);
    if (entLegalEntityId) {
      query = query.where(eq(cashBankAccountsTable.entLegalEntityId, entLegalEntityId)) as any;
    }
    return await query;
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

  // ========== GL AUTO POST RULES (Chunk 5) ==========
  async listGlAutoPostRules(ledgerId: string): Promise<GlAutoPostRule[]> {
    return await db
      .select()
      .from(glAutoPostRulesTable)
      .where(eq(glAutoPostRulesTable.ledgerId, ledgerId));
  },

  async createGlAutoPostRule(rule: InsertGlAutoPostRule): Promise<GlAutoPostRule> {
    const result = await db
      .insert(glAutoPostRulesTable)
      .values(rule)
      .returning();
    return result[0];
  },

  async deleteGlAutoPostRule(id: string): Promise<boolean> {
    const result = await db
      .delete(glAutoPostRulesTable)
      .where(eq(glAutoPostRulesTable.id, id))
      .returning();
    return result.length > 0;
  },

  // ========== GL DATA ACCESS SETS (Chunk 4) ==========
  async listGlDataAccessSets(): Promise<GlDataAccessSet[]> {
    return await db.select().from(glDataAccessSetsTable);
  },

  async createGlDataAccessSet(set: InsertGlDataAccessSet): Promise<GlDataAccessSet> {
    const result = await db
      .insert(glDataAccessSetsTable)
      .values(set)
      .returning();
    return result[0];
  },

  // ========== EXPENSE MANAGEMENT ==========
  async listExpenseReports(tenantId: string, employeeId?: string): Promise<ExpenseReport[]> {
    const conditions = [eq(expenseReportsTable.tenantId, tenantId)];
    if (employeeId) {
      conditions.push(eq(expenseReportsTable.employeeId, employeeId));
    }
    return await db.select().from(expenseReportsTable).where(and(...conditions)).orderBy(desc(expenseReportsTable.createdAt));
  },

  async getExpenseReport(id: string): Promise<ExpenseReport | undefined> {
    const result = await db.select().from(expenseReportsTable).where(eq(expenseReportsTable.id, id));
    return result[0];
  },

  async createExpenseReport(data: InsertExpenseReport): Promise<ExpenseReport> {
    const result = await db.insert(expenseReportsTable).values(data).returning();
    return result[0];
  },

  async updateExpenseReport(id: string, data: Partial<InsertExpenseReport>): Promise<ExpenseReport> {
    const [updated] = await db
      .update(expenseReportsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(expenseReportsTable.id, id))
      .returning();
    return updated;
  },

  async listExpenseLines(reportId: string): Promise<ExpenseLine[]> {
    return await db.select().from(expenseLinesTable).where(eq(expenseLinesTable.reportId, reportId)).orderBy(desc(expenseLinesTable.createdAt));
  },

  async listAllExpenseLines(tenantId: string): Promise<ExpenseLine[]> {
    return await db.select().from(expenseLinesTable).where(eq(expenseLinesTable.tenantId, tenantId)).orderBy(desc(expenseLinesTable.createdAt));
  },

  async createExpenseLine(data: InsertExpenseLine): Promise<ExpenseLine> {
    const result = await db.insert(expenseLinesTable).values(data).returning();
    return result[0];
  },

  async updateExpenseLine(id: string, data: Partial<InsertExpenseLine>): Promise<ExpenseLine> {
    const [updated] = await db
      .update(expenseLinesTable)
      .set(data)
      .where(eq(expenseLinesTable.id, id))
      .returning();
    return updated;
  },

  async listExpensePolicies(tenantId: string): Promise<ExpensePolicy[]> {
    return await db.select().from(expensePoliciesTable).where(eq(expensePoliciesTable.tenantId, tenantId));
  },

  async createExpensePolicy(data: InsertExpensePolicy): Promise<ExpensePolicy> {
    const result = await db.insert(expensePoliciesTable).values(data).returning();
    return result[0];
  },

  async listExpensePerDiems(tenantId: string): Promise<ExpensePerDiem[]> {
    return await db.select().from(expensePerDiemsTable).where(eq(expensePerDiemsTable.tenantId, tenantId));
  },

  async createExpensePerDiem(data: InsertExpensePerDiem): Promise<ExpensePerDiem> {
    const result = await db.insert(expensePerDiemsTable).values(data).returning();
    return result[0];
  },

  async listCorporateCardTransactions(tenantId: string, employeeId?: string): Promise<CorporateCardTransaction[]> {
    if (employeeId) {
      return await db.select().from(corporateCardTransactionsTable).where(and(eq(corporateCardTransactionsTable.tenantId, tenantId), eq(corporateCardTransactionsTable.employeeId, employeeId))).orderBy(desc(corporateCardTransactionsTable.transactionDate));
    }
    return await db.select().from(corporateCardTransactionsTable).where(eq(corporateCardTransactionsTable.tenantId, tenantId)).orderBy(desc(corporateCardTransactionsTable.transactionDate));
  },

  async createCorporateCardTransaction(data: InsertCorporateCardTransaction): Promise<CorporateCardTransaction> {
    const result = await db.insert(corporateCardTransactionsTable).values(data).returning();
    return result[0];
  },

  async updateCorporateCardTransaction(id: string, data: Partial<InsertCorporateCardTransaction>): Promise<CorporateCardTransaction> {
    const [updated] = await db
      .update(corporateCardTransactionsTable)
      .set(data)
      .where(eq(corporateCardTransactionsTable.id, id))
      .returning();
    return updated;
  },

  // Document Sequences (Gapless Config)
  async listArDocumentSequences(module?: string): Promise<ArDocumentSequence[]> {
    if (module) {
      return await db.select().from(arDocumentSequencesTable).where(eq(arDocumentSequencesTable.module, module));
    }
    return await db.select().from(arDocumentSequencesTable);
  },

  async createArDocumentSequence(data: InsertArDocumentSequence): Promise<ArDocumentSequence> {
    const [inserted] = await db.insert(arDocumentSequencesTable).values(data).returning();
    return inserted;
  },

  async updateArDocumentSequence(id: string, data: Partial<InsertArDocumentSequence>): Promise<ArDocumentSequence | undefined> {
    const [updated] = await db.update(arDocumentSequencesTable).set(data).where(eq(arDocumentSequencesTable.id, id)).returning();
    return updated;
  },

  async listArDocumentSequenceAssignments(sequenceId?: string): Promise<ArDocumentSequenceAssignment[]> {
    if (sequenceId) {
      return await db.select().from(arDocumentSequenceAssignmentsTable).where(eq(arDocumentSequenceAssignmentsTable.sequenceId, sequenceId));
    }
    return await db.select().from(arDocumentSequenceAssignmentsTable);
  },

  async createArDocumentSequenceAssignment(data: InsertArDocumentSequenceAssignment): Promise<ArDocumentSequenceAssignment> {
    const [inserted] = await db.insert(arDocumentSequenceAssignmentsTable).values(data).returning();
    return inserted;
  },

  async updateArDocumentSequenceAssignment(id: string, data: Partial<InsertArDocumentSequenceAssignment>): Promise<ArDocumentSequenceAssignment | undefined> {
    const [updated] = await db.update(arDocumentSequenceAssignmentsTable).set(data).where(eq(arDocumentSequenceAssignmentsTable.id, id)).returning();
    return updated;
  },
};
