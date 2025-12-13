import { pgTable, varchar, text, timestamp, numeric, jsonb, boolean, integer, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== SESSION STORAGE (Replit Auth) ==========
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// ========== USERS & PROJECTS ==========
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"),
  name: varchar("name"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"),
  permissions: jsonb("permissions"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  email: z.string().email().optional(),
  password: z.string().optional(),
  name: z.string().optional(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  profileImageUrl: z.string().optional().nullable(),
  role: z.string().optional(),
  permissions: z.record(z.any()).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Type for upsert operations (Replit Auth)
export type UpsertUser = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
};

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  ownerId: varchar("owner_id").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  ownerId: z.string().min(1),
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// ========== FORM DATA PERSISTENCE ==========
export const formData = pgTable("form_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  formId: varchar("form_id").notNull(),
  data: jsonb("data").notNull(),
  status: varchar("status").default("draft"), // draft, submitted, approved, rejected
  submittedBy: varchar("submitted_by"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertFormDataSchema = createInsertSchema(formData).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  formId: z.string().min(1),
  data: z.record(z.any()),
  status: z.string().optional(),
  submittedBy: z.string().optional().nullable(),
  submittedAt: z.date().optional().nullable(),
});

export type InsertFormData = z.infer<typeof insertFormDataSchema>;
export type FormDataRecord = typeof formData.$inferSelect;

// ========== DEMO MANAGEMENT ==========
export const demos = pgTable("demos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  company: varchar("company").notNull(),
  industry: varchar("industry").notNull(),
  status: varchar("status").default("active"), // active, completed, expired
  demoToken: varchar("demo_token").unique(),
  createdAt: timestamp("created_at").default(sql`now()`),
  expiresAt: timestamp("expires_at"),
});

export const insertDemoSchema = createInsertSchema(demos).omit({ id: true, createdAt: true, demoToken: true }).extend({
  email: z.string().email(),
  company: z.string().min(1),
  industry: z.string().min(1),
  status: z.string().optional(),
  expiresAt: z.date().optional().nullable(),
});

export type InsertDemo = z.infer<typeof insertDemoSchema>;
export type Demo = typeof demos.$inferSelect;

// ========== ERP MODULE ==========
export const generalLedger = pgTable("general_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountCode: varchar("account_code").notNull(),
  description: text("description"),
  accountType: varchar("account_type"), // asset, liability, equity, revenue, expense
  balance: numeric("balance", { precision: 18, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number").notNull(),
  customerId: varchar("customer_id"),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  dueDate: timestamp("due_date"),
  status: varchar("status").default("draft"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true }).extend({
  invoiceNumber: z.string().min(1),
  customerId: z.string().optional().nullable(),
  amount: z.string().min(1),
  dueDate: z.date().optional().nullable(),
  status: z.string().optional(),
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// ========== CRM MODULE ==========
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email"),
  company: varchar("company"),
  score: numeric("score", { precision: 5, scale: 2 }).default("0"),
  status: varchar("status").default("new"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  company: z.string().optional().nullable(),
  score: z.string().optional(),
  status: z.string().optional(),
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// ========== PROJECT MANAGEMENT MODULE ==========
export const workOrders = pgTable("work_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  status: varchar("status").default("open"),
  assignedTo: varchar("assigned_to"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({ id: true, createdAt: true }).extend({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.string().optional(),
  assignedTo: z.string().optional().nullable(),
  dueDate: z.date().optional().nullable(),
});

export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
export type WorkOrder = typeof workOrders.$inferSelect;

export const projects2 = pgTable("projects2", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  status: varchar("status").default("active"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertProject2Schema = createInsertSchema(projects2).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.string().optional(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
});

export type InsertProject2 = z.infer<typeof insertProject2Schema>;
export type Project2 = typeof projects2.$inferSelect;

// ========== FINANCE MODULE ==========
export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  category: varchar("category"),
  status: varchar("status").default("pending"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true }).extend({
  description: z.string().min(1),
  amount: z.string().min(1),
  category: z.string().optional(),
  status: z.string().optional(),
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// ========== HR MODULE ==========
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").unique(),
  department: varchar("department"),
  hireDate: timestamp("hire_date"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true }).extend({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  department: z.string().optional(),
  hireDate: z.date().optional().nullable(),
  status: z.string().optional(),
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export const payroll = pgTable("payroll", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  salary: numeric("salary", { precision: 18, scale: 2 }),
  bonus: numeric("bonus", { precision: 18, scale: 2 }).default("0"),
  deductions: numeric("deductions", { precision: 18, scale: 2 }).default("0"),
  netPay: numeric("net_pay", { precision: 18, scale: 2 }),
  payPeriod: varchar("pay_period"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPayrollSchema = createInsertSchema(payroll).omit({ id: true, createdAt: true }).extend({
  employeeId: z.string().min(1),
  salary: z.string().optional(),
  bonus: z.string().optional(),
  deductions: z.string().optional(),
  netPay: z.string().optional(),
  payPeriod: z.string().optional(),
});

export type InsertPayroll = z.infer<typeof insertPayrollSchema>;
export type Payroll = typeof payroll.$inferSelect;

// ========== SUPPLY CHAIN MODULE ==========
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  address: text("address"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.string().optional(),
});

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number").notNull().unique(),
  supplierId: varchar("supplier_id"),
  totalAmount: numeric("total_amount", { precision: 18, scale: 2 }),
  status: varchar("status").default("draft"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ id: true, createdAt: true }).extend({
  orderNumber: z.string().min(1),
  supplierId: z.string().optional(),
  totalAmount: z.string().optional(),
  status: z.string().optional(),
  dueDate: z.date().optional().nullable(),
});

export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemName: varchar("item_name").notNull(),
  sku: varchar("sku").unique(),
  quantity: integer("quantity").default(0),
  reorderLevel: integer("reorder_level"),
  location: varchar("location"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, createdAt: true }).extend({
  itemName: z.string().min(1),
  sku: z.string().optional(),
  quantity: z.number().optional(),
  reorderLevel: z.number().optional(),
  location: z.string().optional(),
});

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

// ========== MANUFACTURING MODULE ==========
export const bom = pgTable("bom", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bomNumber: varchar("bom_number").notNull().unique(),
  productId: varchar("product_id"),
  quantity: integer("quantity"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertBomSchema = createInsertSchema(bom).omit({ id: true, createdAt: true }).extend({
  bomNumber: z.string().min(1),
  productId: z.string().optional(),
  quantity: z.number().optional(),
  status: z.string().optional(),
});

export type InsertBom = z.infer<typeof insertBomSchema>;
export type Bom = typeof bom.$inferSelect;

export const workCenters = pgTable("work_centers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  capacity: integer("capacity"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertWorkCenterSchema = createInsertSchema(workCenters).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  description: z.string().optional(),
  capacity: z.number().optional(),
  status: z.string().optional(),
});

export type InsertWorkCenter = z.infer<typeof insertWorkCenterSchema>;
export type WorkCenter = typeof workCenters.$inferSelect;

export const productionOrders = pgTable("production_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number").notNull().unique(),
  productId: varchar("product_id"),
  quantity: integer("quantity"),
  status: varchar("status").default("planned"),
  scheduledDate: timestamp("scheduled_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertProductionOrderSchema = createInsertSchema(productionOrders).omit({ id: true, createdAt: true }).extend({
  orderNumber: z.string().min(1),
  productId: z.string().optional(),
  quantity: z.number().optional(),
  status: z.string().optional(),
  scheduledDate: z.date().optional().nullable(),
});

export type InsertProductionOrder = z.infer<typeof insertProductionOrderSchema>;
export type ProductionOrder = typeof productionOrders.$inferSelect;

// ========== EDUCATION MODULE ==========
export const educationStudents = pgTable("education_students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  studentId: varchar("student_id").notNull().unique(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email"),
  enrollmentDate: timestamp("enrollment_date"),
  status: varchar("status").default("ACTIVE"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const educationCourses = pgTable("education_courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  courseId: varchar("course_id").notNull().unique(),
  courseName: varchar("course_name").notNull(),
  description: text("description"),
  instructor: varchar("instructor"),
  credits: integer("credits"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const educationEnrollments = pgTable("education_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  studentId: varchar("student_id").notNull(),
  courseId: varchar("course_id").notNull(),
  enrollmentDate: timestamp("enrollment_date"),
  status: varchar("status").default("ENROLLED"),
  grade: varchar("grade"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const educationAssignments = pgTable("education_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  assignmentId: varchar("assignment_id").notNull().unique(),
  courseId: varchar("course_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const educationGrades = pgTable("education_grades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  studentId: varchar("student_id").notNull(),
  courseId: varchar("course_id").notNull(),
  score: integer("score"),
  grade: varchar("grade"),
  gradeDate: timestamp("grade_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const educationBilling = pgTable("education_billing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  invoiceId: varchar("invoice_id").notNull().unique(),
  studentId: varchar("student_id").notNull(),
  amount: numeric("amount"),
  dueDate: timestamp("due_date"),
  status: varchar("status").default("PENDING"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const educationEvents = pgTable("education_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  eventId: varchar("event_id").notNull().unique(),
  eventName: varchar("event_name").notNull(),
  eventDate: timestamp("event_date"),
  capacity: integer("capacity"),
  status: varchar("status").default("SCHEDULED"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const educationAttendance = pgTable("education_attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  studentId: varchar("student_id").notNull(),
  courseId: varchar("course_id"),
  attendanceDate: timestamp("attendance_date"),
  status: varchar("status").default("PRESENT"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== COPILOT AI ASSISTANT ==========
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

// ========== SMARTVIEWS & EXPORT/IMPORT ==========
export const smartViews = pgTable("smart_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  formId: varchar("form_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  filters: jsonb("filters").default(sql`'[]'::jsonb`), // Array of {field, operator, value}
  sortBy: jsonb("sort_by").default(sql`'[]'::jsonb`), // Array of {field, direction}
  visibleColumns: text("visible_columns").array(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertSmartViewSchema = createInsertSchema(smartViews).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  formId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  filters: z.array(z.record(z.any())).optional(),
  sortBy: z.array(z.record(z.any())).optional(),
  visibleColumns: z.array(z.string()).optional(),
});

export type InsertSmartView = z.infer<typeof insertSmartViewSchema>;
export type SmartView = typeof smartViews.$inferSelect;

// ========== REPORTS & REPORTING ==========
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  module: varchar("module").notNull(), // crm, finance, supply_chain, manufacturing, hr, projects, admin
  type: varchar("type").notNull(), // transactional, periodical
  category: varchar("category"), // e.g., sales, accounting, operations
  description: text("description"),
  config: jsonb("config").notNull(), // { columns, filters, sorting, grouping, calculations }
  layout: jsonb("layout"), // drag/drop layout configuration
  template: boolean("template").default(false), // Is this a template?
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  name: z.string().min(1),
  module: z.string().min(1),
  type: z.string().min(1),
  category: z.string().optional(),
  description: z.string().optional(),
  config: z.record(z.any()),
  layout: z.record(z.any()).optional(),
  template: z.boolean().optional(),
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

// ========== CONTACT SUBMISSIONS ==========
export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  company: varchar("company"),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  status: varchar("status").default("new"), // new, read, replied, closed
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  status: z.string().optional(),
});

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// ========== PARTNERS & TRAINERS ==========
export const partners = pgTable("partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  company: varchar("company").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  website: varchar("website"),
  type: varchar("type").notNull().default("partner"), // partner, trainer
  tier: varchar("tier").default("silver"), // gold, silver, platinum, diamond
  description: text("description"),
  logo: varchar("logo"),
  specializations: text("specializations").array(),
  isActive: boolean("is_active").default(true),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertPartnerSchema = createInsertSchema(partners).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  name: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  website: z.string().optional(),
  type: z.enum(["partner", "trainer"]).default("partner"),
  tier: z.enum(["gold", "silver", "platinum", "diamond"]).default("silver"),
  description: z.string().optional(),
  logo: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isApproved: z.boolean().optional(),
});

export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;

// ========== USER FEEDBACK ==========
export const userFeedback = pgTable("user_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  type: varchar("type").notNull(), // suggestion, bug, feature, other
  category: varchar("category"), // ui, performance, functionality, other
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  priority: varchar("priority").default("medium"), // low, medium, high, critical
  status: varchar("status").default("new"), // new, reviewed, in_progress, resolved, closed
  attachmentUrl: varchar("attachment_url"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  userId: z.string().optional(),
  type: z.enum(["suggestion", "bug", "feature", "other"]),
  category: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  status: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
export type UserFeedback = typeof userFeedback.$inferSelect;

// ========== APP MARKETPLACE ==========

// Marketplace Developers (Publishers)
export const marketplaceDevelopers = pgTable("marketplace_developers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  companyName: varchar("company_name").notNull(),
  displayName: varchar("display_name").notNull(),
  email: varchar("email").notNull(),
  website: varchar("website"),
  description: text("description"),
  logo: varchar("logo"),
  status: varchar("status").default("pending"), // pending, approved, suspended
  payoutMethod: varchar("payout_method"), // bank_transfer, paypal, stripe
  payoutDetails: jsonb("payout_details"),
  totalRevenue: numeric("total_revenue", { precision: 18, scale: 2 }).default("0"),
  totalPayouts: numeric("total_payouts", { precision: 18, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertMarketplaceDeveloperSchema = createInsertSchema(marketplaceDevelopers).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  userId: z.string().min(1),
  companyName: z.string().min(1, "Company name is required"),
  displayName: z.string().min(1, "Display name is required"),
  email: z.string().email(),
  website: z.string().url().optional().nullable(),
  description: z.string().optional(),
  logo: z.string().optional(),
  status: z.enum(["pending", "approved", "suspended"]).optional(),
  payoutMethod: z.string().optional(),
  payoutDetails: z.record(z.any()).optional(),
});

export type InsertMarketplaceDeveloper = z.infer<typeof insertMarketplaceDeveloperSchema>;
export type MarketplaceDeveloper = typeof marketplaceDevelopers.$inferSelect;

// App Categories
export const marketplaceCategories = pgTable("marketplace_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  icon: varchar("icon"),
  parentId: varchar("parent_id"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertMarketplaceCategorySchema = createInsertSchema(marketplaceCategories).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export type InsertMarketplaceCategory = z.infer<typeof insertMarketplaceCategorySchema>;
export type MarketplaceCategory = typeof marketplaceCategories.$inferSelect;

// Marketplace Apps
export const marketplaceApps = pgTable("marketplace_apps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  developerId: varchar("developer_id").notNull(),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  shortDescription: varchar("short_description"),
  longDescription: text("long_description"),
  categoryId: varchar("category_id"),
  tags: text("tags").array(),
  supportedIndustries: text("supported_industries").array(),
  icon: varchar("icon"),
  screenshots: text("screenshots").array(),
  demoUrl: varchar("demo_url"),
  documentationUrl: varchar("documentation_url"),
  supportEmail: varchar("support_email"),
  supportUrl: varchar("support_url"),
  pricingModel: varchar("pricing_model").default("free"), // free, one_time, subscription, freemium
  price: numeric("price", { precision: 18, scale: 2 }).default("0"),
  subscriptionPriceMonthly: numeric("subscription_price_monthly", { precision: 18, scale: 2 }),
  subscriptionPriceYearly: numeric("subscription_price_yearly", { precision: 18, scale: 2 }),
  currency: varchar("currency").default("USD"),
  licenseType: varchar("license_type").default("commercial"), // open_source, commercial, dual
  githubUrl: varchar("github_url"),
  deploymentType: varchar("deployment_type").default("saas"), // saas, self_hosted
  compatibility: jsonb("compatibility"), // ERP version, modules
  permissions: text("permissions").array(),
  status: varchar("status").default("draft"), // draft, submitted, approved, rejected, suspended
  rejectionReason: text("rejection_reason"),
  featuredOrder: integer("featured_order"),
  totalInstalls: integer("total_installs").default(0),
  totalRevenue: numeric("total_revenue", { precision: 18, scale: 2 }).default("0"),
  averageRating: numeric("average_rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertMarketplaceAppSchema = createInsertSchema(marketplaceApps).omit({ id: true, createdAt: true, updatedAt: true, publishedAt: true }).extend({
  developerId: z.string().min(1),
  name: z.string().min(1, "App name is required"),
  slug: z.string().min(1),
  shortDescription: z.string().max(200).optional(),
  longDescription: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  supportedIndustries: z.array(z.string()).optional(),
  icon: z.string().optional(),
  screenshots: z.array(z.string()).optional(),
  demoUrl: z.string().url().optional().nullable(),
  documentationUrl: z.string().url().optional().nullable(),
  supportEmail: z.string().email().optional().nullable(),
  supportUrl: z.string().url().optional().nullable(),
  pricingModel: z.enum(["free", "one_time", "subscription", "freemium"]).optional(),
  price: z.string().optional(),
  subscriptionPriceMonthly: z.string().optional().nullable(),
  subscriptionPriceYearly: z.string().optional().nullable(),
  currency: z.string().optional(),
  licenseType: z.enum(["open_source", "commercial", "dual"]).optional(),
  githubUrl: z.string().url().optional().nullable(),
  deploymentType: z.enum(["saas", "self_hosted"]).optional(),
  compatibility: z.record(z.any()).optional(),
  permissions: z.array(z.string()).optional(),
  status: z.enum(["draft", "submitted", "approved", "rejected", "suspended"]).optional(),
});

export type InsertMarketplaceApp = z.infer<typeof insertMarketplaceAppSchema>;
export type MarketplaceApp = typeof marketplaceApps.$inferSelect;

// App Versions
export const marketplaceAppVersions = pgTable("marketplace_app_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").notNull(),
  version: varchar("version").notNull(),
  changelog: text("changelog"),
  releaseNotes: text("release_notes"),
  minErpVersion: varchar("min_erp_version"),
  maxErpVersion: varchar("max_erp_version"),
  downloadUrl: varchar("download_url"),
  fileSize: integer("file_size"),
  checksum: varchar("checksum"),
  isLatest: boolean("is_latest").default(false),
  status: varchar("status").default("pending"), // pending, approved, rejected, archived
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertMarketplaceAppVersionSchema = createInsertSchema(marketplaceAppVersions).omit({ id: true, createdAt: true, publishedAt: true }).extend({
  appId: z.string().min(1),
  version: z.string().min(1),
  changelog: z.string().optional(),
  releaseNotes: z.string().optional(),
  minErpVersion: z.string().optional(),
  maxErpVersion: z.string().optional(),
  downloadUrl: z.string().optional(),
  fileSize: z.number().optional(),
  checksum: z.string().optional(),
  isLatest: z.boolean().optional(),
  status: z.enum(["pending", "approved", "rejected", "archived"]).optional(),
});

export type InsertMarketplaceAppVersion = z.infer<typeof insertMarketplaceAppVersionSchema>;
export type MarketplaceAppVersion = typeof marketplaceAppVersions.$inferSelect;

// App Installations (per tenant)
export const marketplaceInstallations = pgTable("marketplace_installations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").notNull(),
  appVersionId: varchar("app_version_id"),
  tenantId: varchar("tenant_id").notNull(),
  installedBy: varchar("installed_by").notNull(),
  status: varchar("status").default("active"), // active, suspended, uninstalled
  installedAt: timestamp("installed_at").default(sql`now()`),
  uninstalledAt: timestamp("uninstalled_at"),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertMarketplaceInstallationSchema = createInsertSchema(marketplaceInstallations).omit({ id: true, createdAt: true, updatedAt: true, installedAt: true }).extend({
  appId: z.string().min(1),
  appVersionId: z.string().optional(),
  tenantId: z.string().min(1),
  installedBy: z.string().min(1),
  status: z.enum(["active", "suspended", "uninstalled"]).optional(),
  settings: z.record(z.any()).optional(),
});

export type InsertMarketplaceInstallation = z.infer<typeof insertMarketplaceInstallationSchema>;
export type MarketplaceInstallation = typeof marketplaceInstallations.$inferSelect;

// App Transactions (purchases)
export const marketplaceTransactions = pgTable("marketplace_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").notNull(),
  developerId: varchar("developer_id").notNull(),
  tenantId: varchar("tenant_id").notNull(),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(), // purchase, subscription, renewal, refund
  grossAmount: numeric("gross_amount", { precision: 18, scale: 2 }).notNull(),
  platformCommissionRate: numeric("platform_commission_rate", { precision: 5, scale: 2 }).default("0"),
  platformCommission: numeric("platform_commission", { precision: 18, scale: 2 }).default("0"),
  developerRevenue: numeric("developer_revenue", { precision: 18, scale: 2 }).notNull(),
  tax: numeric("tax", { precision: 18, scale: 2 }).default("0"),
  currency: varchar("currency").default("USD"),
  paymentMethod: varchar("payment_method"),
  paymentReference: varchar("payment_reference"),
  status: varchar("status").default("completed"), // pending, completed, failed, refunded
  invoiceUrl: varchar("invoice_url"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertMarketplaceTransactionSchema = createInsertSchema(marketplaceTransactions).omit({ id: true, createdAt: true }).extend({
  appId: z.string().min(1),
  developerId: z.string().min(1),
  tenantId: z.string().min(1),
  userId: z.string().min(1),
  type: z.enum(["purchase", "subscription", "renewal", "refund"]),
  grossAmount: z.string().min(1),
  platformCommissionRate: z.string().optional(),
  platformCommission: z.string().optional(),
  developerRevenue: z.string().min(1),
  tax: z.string().optional(),
  currency: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
  status: z.enum(["pending", "completed", "failed", "refunded"]).optional(),
  invoiceUrl: z.string().optional(),
});

export type InsertMarketplaceTransaction = z.infer<typeof insertMarketplaceTransactionSchema>;
export type MarketplaceTransaction = typeof marketplaceTransactions.$inferSelect;

// App Subscriptions
export const marketplaceSubscriptions = pgTable("marketplace_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").notNull(),
  tenantId: varchar("tenant_id").notNull(),
  userId: varchar("user_id").notNull(),
  plan: varchar("plan").notNull(), // monthly, yearly
  status: varchar("status").default("active"), // active, cancelled, expired, paused
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency").default("USD"),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),
  autoRenew: boolean("auto_renew").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertMarketplaceSubscriptionSchema = createInsertSchema(marketplaceSubscriptions).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  appId: z.string().min(1),
  tenantId: z.string().min(1),
  userId: z.string().min(1),
  plan: z.enum(["monthly", "yearly"]),
  status: z.enum(["active", "cancelled", "expired", "paused"]).optional(),
  amount: z.string().min(1),
  currency: z.string().optional(),
  currentPeriodStart: z.date(),
  currentPeriodEnd: z.date(),
  cancelledAt: z.date().optional().nullable(),
  cancelReason: z.string().optional(),
  autoRenew: z.boolean().optional(),
});

export type InsertMarketplaceSubscription = z.infer<typeof insertMarketplaceSubscriptionSchema>;
export type MarketplaceSubscription = typeof marketplaceSubscriptions.$inferSelect;

// App Reviews
export const marketplaceReviews = pgTable("marketplace_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").notNull(),
  appVersionId: varchar("app_version_id"),
  userId: varchar("user_id").notNull(),
  tenantId: varchar("tenant_id").notNull(),
  rating: integer("rating").notNull(),
  title: varchar("title"),
  content: text("content"),
  developerResponse: text("developer_response"),
  developerResponseAt: timestamp("developer_response_at"),
  status: varchar("status").default("published"), // pending, published, hidden, flagged
  helpfulCount: integer("helpful_count").default(0),
  reportedCount: integer("reported_count").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertMarketplaceReviewSchema = createInsertSchema(marketplaceReviews).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  appId: z.string().min(1),
  appVersionId: z.string().optional(),
  userId: z.string().min(1),
  tenantId: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  content: z.string().optional(),
  developerResponse: z.string().optional(),
  status: z.enum(["pending", "published", "hidden", "flagged"]).optional(),
});

export type InsertMarketplaceReview = z.infer<typeof insertMarketplaceReviewSchema>;
export type MarketplaceReview = typeof marketplaceReviews.$inferSelect;

// Developer Payouts
export const marketplacePayouts = pgTable("marketplace_payouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  developerId: varchar("developer_id").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency").default("USD"),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  status: varchar("status").default("pending"), // pending, processing, paid, failed
  paymentMethod: varchar("payment_method"),
  paymentReference: varchar("payment_reference"),
  paidAt: timestamp("paid_at"),
  statementUrl: varchar("statement_url"),
  transactionCount: integer("transaction_count").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertMarketplacePayoutSchema = createInsertSchema(marketplacePayouts).omit({ id: true, createdAt: true }).extend({
  developerId: z.string().min(1),
  amount: z.string().min(1),
  currency: z.string().optional(),
  periodStart: z.date(),
  periodEnd: z.date(),
  status: z.enum(["pending", "processing", "paid", "failed"]).optional(),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
  paidAt: z.date().optional().nullable(),
  statementUrl: z.string().optional(),
  transactionCount: z.number().optional(),
  notes: z.string().optional(),
});

export type InsertMarketplacePayout = z.infer<typeof insertMarketplacePayoutSchema>;
export type MarketplacePayout = typeof marketplacePayouts.$inferSelect;

// Platform Commission Settings
export const marketplaceCommissionSettings = pgTable("marketplace_commission_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").default("global"), // global, category, developer
  targetId: varchar("target_id"), // category_id or developer_id for specific rates
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).default("0"), // percentage
  minCommission: numeric("min_commission", { precision: 18, scale: 2 }),
  maxCommission: numeric("max_commission", { precision: 18, scale: 2 }),
  isActive: boolean("is_active").default(true),
  effectiveFrom: timestamp("effective_from").default(sql`now()`),
  effectiveTo: timestamp("effective_to"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertMarketplaceCommissionSettingSchema = createInsertSchema(marketplaceCommissionSettings).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  name: z.string().min(1),
  type: z.enum(["global", "category", "developer"]).optional(),
  targetId: z.string().optional(),
  commissionRate: z.string().optional(),
  minCommission: z.string().optional().nullable(),
  maxCommission: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  effectiveFrom: z.date().optional(),
  effectiveTo: z.date().optional().nullable(),
});

export type InsertMarketplaceCommissionSetting = z.infer<typeof insertMarketplaceCommissionSettingSchema>;
export type MarketplaceCommissionSetting = typeof marketplaceCommissionSettings.$inferSelect;

// Marketplace Audit Logs - Tracks all marketplace actions for compliance
export const marketplaceAuditLogs = pgTable("marketplace_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type").notNull(), // app, app_version, developer, payout, commission, license, review
  entityId: varchar("entity_id").notNull(),
  action: varchar("action").notNull(), // submitted, approved, rejected, archived, price_changed, commission_changed, payout_initiated, payout_completed, license_issued, license_expired
  actorId: varchar("actor_id").notNull(), // User who performed the action
  actorRole: varchar("actor_role"), // admin, developer, tenant_admin
  previousState: jsonb("previous_state"), // State before action
  newState: jsonb("new_state"), // State after action
  metadata: jsonb("metadata"), // Additional context (rejection reason, etc.)
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertMarketplaceAuditLogSchema = createInsertSchema(marketplaceAuditLogs).omit({ id: true, createdAt: true }).extend({
  entityType: z.enum(["app", "app_version", "developer", "payout", "commission", "license", "review", "installation", "transaction"]),
  entityId: z.string().min(1),
  action: z.string().min(1),
  actorId: z.string().min(1),
  actorRole: z.string().optional(),
  previousState: z.record(z.any()).optional(),
  newState: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type InsertMarketplaceAuditLog = z.infer<typeof insertMarketplaceAuditLogSchema>;
export type MarketplaceAuditLog = typeof marketplaceAuditLogs.$inferSelect;

// Marketplace Licenses - Tracks app licenses per tenant with expiry and grace period
export const marketplaceLicenses = pgTable("marketplace_licenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").notNull(),
  appVersionId: varchar("app_version_id"),
  tenantId: varchar("tenant_id").notNull(),
  userId: varchar("user_id").notNull(), // Who purchased the license
  transactionId: varchar("transaction_id"), // Related purchase transaction
  licenseKey: varchar("license_key").unique(),
  licenseType: varchar("license_type").notNull(), // perpetual, subscription, trial
  status: varchar("status").default("active"), // active, expired, suspended, revoked
  seats: integer("seats").default(0), // 0 = unlimited
  usedSeats: integer("used_seats").default(0),
  validFrom: timestamp("valid_from").default(sql`now()`),
  validUntil: timestamp("valid_until"), // null for perpetual
  gracePeriodDays: integer("grace_period_days").default(7),
  gracePeriodEnd: timestamp("grace_period_end"),
  lastValidatedAt: timestamp("last_validated_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertMarketplaceLicenseSchema = createInsertSchema(marketplaceLicenses).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  appId: z.string().min(1),
  appVersionId: z.string().optional(),
  tenantId: z.string().min(1),
  userId: z.string().min(1),
  transactionId: z.string().optional(),
  licenseKey: z.string().optional(),
  licenseType: z.enum(["perpetual", "subscription", "trial"]),
  status: z.enum(["active", "expired", "suspended", "revoked"]).optional(),
  seats: z.number().optional(),
  usedSeats: z.number().optional(),
  validFrom: z.date().optional(),
  validUntil: z.date().optional().nullable(),
  gracePeriodDays: z.number().optional(),
  gracePeriodEnd: z.date().optional().nullable(),
  lastValidatedAt: z.date().optional().nullable(),
  metadata: z.record(z.any()).optional(),
});

export type InsertMarketplaceLicense = z.infer<typeof insertMarketplaceLicenseSchema>;
export type MarketplaceLicense = typeof marketplaceLicenses.$inferSelect;

// App Dependencies - Tracks which apps depend on other apps
export const marketplaceAppDependencies = pgTable("marketplace_app_dependencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").notNull(),
  dependsOnAppId: varchar("depends_on_app_id").notNull(),
  minVersion: varchar("min_version"),
  maxVersion: varchar("max_version"),
  isRequired: boolean("is_required").default(true), // required vs optional
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertMarketplaceAppDependencySchema = createInsertSchema(marketplaceAppDependencies).omit({ id: true, createdAt: true }).extend({
  appId: z.string().min(1),
  dependsOnAppId: z.string().min(1),
  minVersion: z.string().optional(),
  maxVersion: z.string().optional(),
  isRequired: z.boolean().optional(),
});

export type InsertMarketplaceAppDependency = z.infer<typeof insertMarketplaceAppDependencySchema>;
export type MarketplaceAppDependency = typeof marketplaceAppDependencies.$inferSelect;

// ============================================
// TENANTS & INDUSTRY DEPLOYMENTS
// ============================================

// Tenants - Organizations using the platform
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  logoUrl: varchar("logo_url"),
  status: varchar("status").default("active"), // active, inactive, suspended
  settings: jsonb("settings"), // tenant-specific settings
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  name: z.string().min(1, "Tenant name is required"),
  slug: z.string().min(1),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  settings: z.record(z.any()).optional(),
});

export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;

// Industries - Reference table for industry templates
export const industries = pgTable("industries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  icon: varchar("icon"),
  defaultModules: text("default_modules").array(), // modules enabled by default
  configSchema: jsonb("config_schema"), // JSON schema for industry-specific config
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertIndustrySchema = createInsertSchema(industries).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1, "Industry name is required"),
  slug: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  defaultModules: z.array(z.string()).optional(),
  configSchema: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export type InsertIndustry = z.infer<typeof insertIndustrySchema>;
export type Industry = typeof industries.$inferSelect;

// Industry Deployments - Tracks which industries are deployed to which tenants
export const industryDeployments = pgTable("industry_deployments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  industryId: varchar("industry_id").notNull(),
  enabledModules: text("enabled_modules").array(), // can override default modules
  customConfig: jsonb("custom_config"), // industry-specific customizations
  status: varchar("status").default("active"), // active, inactive, pending
  deployedBy: varchar("deployed_by"),
  deployedAt: timestamp("deployed_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertIndustryDeploymentSchema = createInsertSchema(industryDeployments).omit({ id: true, deployedAt: true, updatedAt: true }).extend({
  tenantId: z.string().min(1),
  industryId: z.string().min(1),
  enabledModules: z.array(z.string()).optional(),
  customConfig: z.record(z.any()).optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
  deployedBy: z.string().optional(),
});

export type InsertIndustryDeployment = z.infer<typeof insertIndustryDeploymentSchema>;
export type IndustryDeployment = typeof industryDeployments.$inferSelect;

// Industry App Recommendations - Curated apps for each industry
export const industryAppRecommendations = pgTable("industry_app_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  industryId: varchar("industry_id").notNull(),
  appId: varchar("app_id").notNull(),
  ranking: integer("ranking").default(0),
  reason: text("reason"), // Why this app is recommended
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertIndustryAppRecommendationSchema = createInsertSchema(industryAppRecommendations).omit({ id: true, createdAt: true }).extend({
  industryId: z.string().min(1),
  appId: z.string().min(1),
  ranking: z.number().optional(),
  reason: z.string().optional(),
});

export type InsertIndustryAppRecommendation = z.infer<typeof insertIndustryAppRecommendationSchema>;
export type IndustryAppRecommendation = typeof industryAppRecommendations.$inferSelect;

// ============================================
// CUSTOMIZABLE DASHBOARD & GAMIFICATION
// ============================================

// User Dashboard Widgets - Pinned apps and widgets for quick access
export const userDashboardWidgets = pgTable("user_dashboard_widgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  widgetType: varchar("widget_type").notNull(), // "app" | "stat" | "chart" | "activity" | "quick_action"
  appId: varchar("app_id"), // For app widgets
  title: varchar("title").notNull(),
  config: jsonb("config"), // Widget-specific configuration
  position: integer("position").default(0),
  size: varchar("size").default("medium"), // "small" | "medium" | "large"
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertUserDashboardWidgetSchema = createInsertSchema(userDashboardWidgets).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  userId: z.string().min(1),
  widgetType: z.enum(["app", "stat", "chart", "activity", "quick_action"]),
  appId: z.string().optional().nullable(),
  title: z.string().min(1),
  config: z.record(z.any()).optional(),
  position: z.number().optional(),
  size: z.enum(["small", "medium", "large"]).optional(),
  isVisible: z.boolean().optional(),
});

export type InsertUserDashboardWidget = z.infer<typeof insertUserDashboardWidgetSchema>;
export type UserDashboardWidget = typeof userDashboardWidgets.$inferSelect;

// User Badges - Gamification achievements
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  badgeId: varchar("badge_id").notNull(),
  badgeName: varchar("badge_name").notNull(),
  badgeDescription: text("badge_description"),
  badgeIcon: varchar("badge_icon"),
  badgeCategory: varchar("badge_category"), // "contributor" | "reviewer" | "developer" | "power_user"
  points: integer("points").default(0),
  earnedAt: timestamp("earned_at").default(sql`now()`),
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({ id: true, earnedAt: true }).extend({
  userId: z.string().min(1),
  badgeId: z.string().min(1),
  badgeName: z.string().min(1),
  badgeDescription: z.string().optional(),
  badgeIcon: z.string().optional(),
  badgeCategory: z.string().optional(),
  points: z.number().optional(),
});

export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;

// Badge Definitions - Available badges in the system
export const badgeDefinitions = pgTable("badge_definitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  icon: varchar("icon"),
  category: varchar("category").notNull(), // "contributor" | "reviewer" | "developer" | "power_user"
  points: integer("points").default(10),
  criteria: jsonb("criteria"), // Rules for earning badge
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertBadgeDefinitionSchema = createInsertSchema(badgeDefinitions).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  category: z.string().min(1),
  points: z.number().optional(),
  criteria: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

export type InsertBadgeDefinition = z.infer<typeof insertBadgeDefinitionSchema>;
export type BadgeDefinition = typeof badgeDefinitions.$inferSelect;

// User Activity Points - For leaderboards
export const userActivityPoints = pgTable("user_activity_points", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  activityType: varchar("activity_type").notNull(), // "app_install" | "review" | "app_publish" | "contribution"
  points: integer("points").default(0),
  description: text("description"),
  referenceId: varchar("reference_id"), // app_id, review_id, etc.
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertUserActivityPointSchema = createInsertSchema(userActivityPoints).omit({ id: true, createdAt: true }).extend({
  userId: z.string().min(1),
  activityType: z.string().min(1),
  points: z.number().optional(),
  description: z.string().optional(),
  referenceId: z.string().optional(),
});

export type InsertUserActivityPoint = z.infer<typeof insertUserActivityPointSchema>;
export type UserActivityPoint = typeof userActivityPoints.$inferSelect;

// Developer Spotlight - Featured developers
export const developerSpotlight = pgTable("developer_spotlight", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  developerId: varchar("developer_id").notNull(),
  featuredReason: text("featured_reason"),
  isTrending: boolean("is_trending").default(false),
  isNew: boolean("is_new").default(false),
  isFeatured: boolean("is_featured").default(false),
  displayOrder: integer("display_order").default(0),
  featuredFrom: timestamp("featured_from").default(sql`now()`),
  featuredUntil: timestamp("featured_until"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertDeveloperSpotlightSchema = createInsertSchema(developerSpotlight).omit({ id: true, createdAt: true }).extend({
  developerId: z.string().min(1),
  featuredReason: z.string().optional(),
  isTrending: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  displayOrder: z.number().optional(),
  featuredFrom: z.date().optional(),
  featuredUntil: z.date().optional().nullable(),
});

export type InsertDeveloperSpotlight = z.infer<typeof insertDeveloperSpotlightSchema>;
export type DeveloperSpotlight = typeof developerSpotlight.$inferSelect;

// User Notifications - In-app notification system
export const userNotifications = pgTable("user_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(), // "app_update" | "new_feature" | "recommendation" | "badge_earned" | "system"
  title: varchar("title").notNull(),
  message: text("message"),
  icon: varchar("icon"),
  actionUrl: varchar("action_url"),
  referenceType: varchar("reference_type"), // "app" | "badge" | "review"
  referenceId: varchar("reference_id"),
  isRead: boolean("is_read").default(false),
  isArchived: boolean("is_archived").default(false),
  priority: varchar("priority").default("normal"), // "low" | "normal" | "high"
  createdAt: timestamp("created_at").default(sql`now()`),
  readAt: timestamp("read_at"),
});

export const insertUserNotificationSchema = createInsertSchema(userNotifications).omit({ id: true, createdAt: true, readAt: true }).extend({
  userId: z.string().min(1),
  type: z.enum(["app_update", "new_feature", "recommendation", "badge_earned", "system"]),
  title: z.string().min(1),
  message: z.string().optional(),
  icon: z.string().optional(),
  actionUrl: z.string().optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  priority: z.enum(["low", "normal", "high"]).optional(),
});

export type InsertUserNotification = z.infer<typeof insertUserNotificationSchema>;
export type UserNotification = typeof userNotifications.$inferSelect;
