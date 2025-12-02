/**
 * Database-backed storage implementation
 * Replaces in-memory stores with persistent PostgreSQL storage
 */

import { db } from "./db";
import { eq, and } from "drizzle-orm";
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
} from "@shared/schema";
import type {
  Invoice,
  InsertInvoice,
  Lead,
  InsertLead,
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
      .values(lead)
      .returning();
    return result[0];
  },

  async updateLead(
    id: string,
    lead: Partial<InsertLead>
  ): Promise<Lead | undefined> {
    const result = await db
      .update(leadsTable)
      .set(lead)
      .where(eq(leadsTable.id, id))
      .returning();
    return result[0];
  },

  // ========== WORK ORDERS ==========
  async getWorkOrder(id: string): Promise<WorkOrder | undefined> {
    const result = await db
      .select()
      .from(workOrdersTable)
      .where(eq(workOrdersTable.id, id))
      .limit(1);
    return result[0];
  },

  async listWorkOrders(): Promise<WorkOrder[]> {
    return await db.select().from(workOrdersTable);
  },

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
};
