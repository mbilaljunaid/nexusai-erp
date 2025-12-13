import {
  type User, type InsertUser, type UpsertUser,
  type Project, type InsertProject,
  type Invoice, type InsertInvoice,
  type Lead, type InsertLead,
  type WorkOrder, type InsertWorkOrder,
  type Employee, type InsertEmployee,
  type MobileDevice, type InsertMobileDevice,
  type OfflineSync, type InsertOfflineSync,
  type CopilotConversation, type InsertCopilotConversation,
  type CopilotMessage, type InsertCopilotMessage,
  type RevenueForecast, type InsertRevenueForecast,
  type BudgetAllocation, type InsertBudgetAllocation,
  type TimeSeriesData, type InsertTimeSeriesData,
  type ForecastModel, type InsertForecastModel,
  type Scenario, type InsertScenario,
  type ScenarioVariable, type InsertScenarioVariable,
  type DashboardWidget, type InsertDashboardWidget,
  type Report, type InsertReport,
  type AuditLog, type InsertAuditLog,
  type App, type InsertApp,
  type AppReview, type InsertAppReview,
  type AppInstallation, type InsertAppInstallation,
  type Connector, type InsertConnector,
  type ConnectorInstance, type InsertConnectorInstance,
  type WebhookEvent, type InsertWebhookEvent,
  type AbacRule, type InsertAbacRule,
  type EncryptedField, type InsertEncryptedField,
  type ComplianceConfig, type InsertComplianceConfig,
  type Sprint, type InsertSprint,
  type Issue, type InsertIssue,
  type DataLake, type InsertDataLake,
  type EtlPipeline, type InsertEtlPipeline,
  type BiDashboard, type InsertBiDashboard,
  type FieldServiceJob, type InsertFieldServiceJob,
  type PayrollConfig, type InsertPayrollConfig,
  type Tenant, type InsertTenant,
  type Role, type InsertRole,
  type Plan, type InsertPlan,
  type Subscription, type InsertSubscription,
  type Payment, type InsertPayment,
  type Demo, type InsertDemo,
  type Partner, type InsertPartner,
  type UserFeedback, type InsertUserFeedback,
  type Industry, type InsertIndustry,
  type IndustryDeployment, type InsertIndustryDeployment,
  type CommunitySpace, type InsertCommunitySpace,
  type CommunityPost, type InsertCommunityPost,
  type CommunityComment, type InsertCommunityComment,
  type CommunityVote, type InsertCommunityVote,
  type UserTrustLevel, type InsertUserTrustLevel,
  type ReputationEvent, type InsertReputationEvent,
  type CommunityBadgeProgress, type InsertCommunityBadgeProgress,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  upsertUser(user: UpsertUser): Promise<User>;
  getTenant(id: string): Promise<Tenant | undefined>;
  listTenants(): Promise<Tenant[]>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;

  getRole(id: string): Promise<Role | undefined>;
  listRoles(tenantId?: string): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;

  getPlan(id: string): Promise<Plan | undefined>;
  listPlans(): Promise<Plan[]>;
  createPlan(plan: InsertPlan): Promise<Plan>;

  getSubscription(id: string): Promise<Subscription | undefined>;
  listSubscriptions(tenantId?: string): Promise<Subscription[]>;
  createSubscription(sub: InsertSubscription): Promise<Subscription>;

  getPayment(id: string): Promise<Payment | undefined>;
  listPayments(invoiceId?: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;

  getDemo(id: string): Promise<Demo | undefined>;
  listDemos(): Promise<Demo[]>;
  createDemo(demo: InsertDemo): Promise<Demo>;
  deleteDemo(id: string): Promise<boolean>;
  updateDemo(id: string, demo: Partial<InsertDemo>): Promise<Demo | undefined>;

  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  listUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;

  getProject(id: string): Promise<Project | undefined>;
  listProjects(ownerId?: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;

  getInvoice(id: string): Promise<Invoice | undefined>;
  listInvoices(customerId?: string): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;

  getLead(id: string): Promise<Lead | undefined>;
  listLeads(): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;

  getWorkOrder(id: string): Promise<WorkOrder | undefined>;
  listWorkOrders(): Promise<WorkOrder[]>;
  createWorkOrder(order: InsertWorkOrder): Promise<WorkOrder>;

  getEmployee(id: string): Promise<Employee | undefined>;
  listEmployees(department?: string): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;

  getMobileDevice(id: string): Promise<MobileDevice | undefined>;
  listMobileDevices(userId?: string): Promise<MobileDevice[]>;
  createMobileDevice(device: InsertMobileDevice): Promise<MobileDevice>;
  registerMobileDevice(device: InsertMobileDevice): Promise<MobileDevice>;
  updateMobileDeviceSync(deviceId: string): Promise<MobileDevice | undefined>;

  getOfflineSync(id: string): Promise<OfflineSync | undefined>;
  listOfflineSync(deviceId?: string): Promise<OfflineSync[]>;
  createOfflineSync(sync: InsertOfflineSync): Promise<OfflineSync>;
  getOfflineSyncQueue(deviceId: string): Promise<OfflineSync[]>;
  addToOfflineQueue(sync: InsertOfflineSync): Promise<OfflineSync>;

  getCopilotConversation(id: string): Promise<CopilotConversation | undefined>;
  listCopilotConversations(userId?: string): Promise<CopilotConversation[]>;
  createCopilotConversation(conv: InsertCopilotConversation): Promise<CopilotConversation>;

  getCopilotMessage(id: string): Promise<CopilotMessage | undefined>;
  listCopilotMessages(conversationId?: string): Promise<CopilotMessage[]>;
  createCopilotMessage(msg: InsertCopilotMessage): Promise<CopilotMessage>;

  getRevenueForecast(id: string): Promise<RevenueForecast | undefined>;
  listRevenueForecasts(): Promise<RevenueForecast[]>;
  createRevenueForecast(forecast: InsertRevenueForecast): Promise<RevenueForecast>;

  getBudgetAllocation(id: string): Promise<BudgetAllocation | undefined>;
  listBudgetAllocations(year?: number): Promise<BudgetAllocation[]>;
  createBudgetAllocation(budget: InsertBudgetAllocation): Promise<BudgetAllocation>;

  getTimeSeriesData(id: string): Promise<TimeSeriesData | undefined>;
  listTimeSeriesData(): Promise<TimeSeriesData[]>;
  createTimeSeriesData(data: InsertTimeSeriesData): Promise<TimeSeriesData>;

  getForecastModel(id: string): Promise<ForecastModel | undefined>;
  listForecastModels(): Promise<ForecastModel[]>;
  createForecastModel(model: InsertForecastModel): Promise<ForecastModel>;

  getScenario(id: string): Promise<Scenario | undefined>;
  listScenarios(): Promise<Scenario[]>;
  createScenario(scenario: InsertScenario): Promise<Scenario>;

  getScenarioVariable(id: string): Promise<ScenarioVariable | undefined>;
  listScenarioVariables(scenarioId?: string): Promise<ScenarioVariable[]>;
  createScenarioVariable(variable: InsertScenarioVariable): Promise<ScenarioVariable>;
  getScenarioVariables(scenarioId: string): Promise<ScenarioVariable[]>;
  addScenarioVariable(variable: InsertScenarioVariable): Promise<ScenarioVariable>;

  getDashboardWidget(id: string): Promise<DashboardWidget | undefined>;
  listDashboardWidgets(dashboardId?: string): Promise<DashboardWidget[]>;
  createDashboardWidget(widget: InsertDashboardWidget): Promise<DashboardWidget>;

  getReport(id: string): Promise<Report | undefined>;
  listReports(): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;

  getAuditLog(id: string): Promise<AuditLog | undefined>;
  listAuditLogs(): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;

  getApp(id: string): Promise<App | undefined>;
  listApps(): Promise<App[]>;
  createApp(app: InsertApp): Promise<App>;

  getAppReview(id: string): Promise<AppReview | undefined>;
  listAppReviews(appId?: string): Promise<AppReview[]>;
  createAppReview(review: InsertAppReview): Promise<AppReview>;

  getAppInstallation(id: string): Promise<AppInstallation | undefined>;
  listAppInstallations(userId?: string): Promise<AppInstallation[]>;
  createAppInstallation(inst: InsertAppInstallation): Promise<AppInstallation>;

  getConnector(id: string): Promise<Connector | undefined>;
  listConnectors(): Promise<Connector[]>;
  createConnector(connector: InsertConnector): Promise<Connector>;

  getConnectorInstance(id: string): Promise<ConnectorInstance | undefined>;
  listConnectorInstances(userId?: string): Promise<ConnectorInstance[]>;
  createConnectorInstance(instance: InsertConnectorInstance): Promise<ConnectorInstance>;

  getWebhookEvent(id: string): Promise<WebhookEvent | undefined>;
  listWebhookEvents(): Promise<WebhookEvent[]>;
  createWebhookEvent(event: InsertWebhookEvent): Promise<WebhookEvent>;

  getAbacRule(id: string): Promise<AbacRule | undefined>;
  listAbacRules(): Promise<AbacRule[]>;
  createAbacRule(rule: InsertAbacRule): Promise<AbacRule>;

  getEncryptedField(id: string): Promise<EncryptedField | undefined>;
  listEncryptedFields(): Promise<EncryptedField[]>;
  createEncryptedField(field: InsertEncryptedField): Promise<EncryptedField>;

  getComplianceConfig(id: string): Promise<ComplianceConfig | undefined>;
  listComplianceConfigs(): Promise<ComplianceConfig[]>;
  createComplianceConfig(config: InsertComplianceConfig): Promise<ComplianceConfig>;

  getSprint(id: string): Promise<Sprint | undefined>;
  listSprints(projectId?: string): Promise<Sprint[]>;
  createSprint(sprint: InsertSprint): Promise<Sprint>;

  getIssue(id: string): Promise<Issue | undefined>;
  listIssues(sprintId?: string): Promise<Issue[]>;
  createIssue(issue: InsertIssue): Promise<Issue>;

  getDataLake(id: string): Promise<DataLake | undefined>;
  listDataLakes(): Promise<DataLake[]>;
  createDataLake(lake: InsertDataLake): Promise<DataLake>;

  getEtlPipeline(id: string): Promise<EtlPipeline | undefined>;
  listEtlPipelines(): Promise<EtlPipeline[]>;
  createEtlPipeline(pipeline: InsertEtlPipeline): Promise<EtlPipeline>;

  getBiDashboard(id: string): Promise<BiDashboard | undefined>;
  listBiDashboards(): Promise<BiDashboard[]>;
  createBiDashboard(dashboard: InsertBiDashboard): Promise<BiDashboard>;

  getFieldServiceJob(id: string): Promise<FieldServiceJob | undefined>;
  listFieldServiceJobs(status?: string): Promise<FieldServiceJob[]>;
  createFieldServiceJob(job: InsertFieldServiceJob): Promise<FieldServiceJob>;

  getPayrollConfig(id: string): Promise<PayrollConfig | undefined>;
  listPayrollConfigs(): Promise<PayrollConfig[]>;
  createPayrollConfig(config: InsertPayrollConfig): Promise<PayrollConfig>;

  getPartner(id: string): Promise<Partner | undefined>;
  listPartners(filters?: { type?: string; tier?: string; isApproved?: boolean; search?: string }): Promise<Partner[]>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: string, partner: Partial<InsertPartner>): Promise<Partner | undefined>;
  deletePartner(id: string): Promise<boolean>;

  getUserFeedback(id: string): Promise<UserFeedback | undefined>;
  listUserFeedback(): Promise<UserFeedback[]>;
  createUserFeedback(feedback: InsertUserFeedback): Promise<UserFeedback>;

  // Industry operations
  getIndustry(id: string): Promise<Industry | undefined>;
  listIndustries(): Promise<Industry[]>;
  createIndustry(industry: InsertIndustry): Promise<Industry>;

  // Industry Deployment operations
  getIndustryDeployment(id: string): Promise<IndustryDeployment | undefined>;
  listIndustryDeployments(tenantId?: string): Promise<IndustryDeployment[]>;
  createIndustryDeployment(deployment: InsertIndustryDeployment): Promise<IndustryDeployment>;
  updateIndustryDeployment(id: string, deployment: Partial<InsertIndustryDeployment>): Promise<IndustryDeployment | undefined>;
  deleteIndustryDeployment(id: string): Promise<boolean>;

  // Community Space operations
  getCommunitySpace(id: string): Promise<CommunitySpace | undefined>;
  getCommunitySpaceBySlug(slug: string): Promise<CommunitySpace | undefined>;
  listCommunitySpaces(): Promise<CommunitySpace[]>;
  createCommunitySpace(space: InsertCommunitySpace): Promise<CommunitySpace>;

  // Community Post operations
  getCommunityPost(id: string): Promise<CommunityPost | undefined>;
  listCommunityPosts(spaceId?: string): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  updateCommunityPost(id: string, post: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined>;

  // Community Comment operations
  getCommunityComment(id: string): Promise<CommunityComment | undefined>;
  listCommunityComments(postId: string): Promise<CommunityComment[]>;
  createCommunityComment(comment: InsertCommunityComment): Promise<CommunityComment>;

  // Community Vote operations
  getCommunityVote(userId: string, targetType: string, targetId: string): Promise<CommunityVote | undefined>;
  createCommunityVote(vote: InsertCommunityVote): Promise<CommunityVote>;
  deleteCommunityVote(userId: string, targetType: string, targetId: string): Promise<boolean>;

  // User Trust Level operations
  getUserTrustLevel(userId: string): Promise<UserTrustLevel | undefined>;
  createUserTrustLevel(trust: InsertUserTrustLevel): Promise<UserTrustLevel>;
  updateUserTrustLevel(userId: string, trust: Partial<InsertUserTrustLevel>): Promise<UserTrustLevel | undefined>;

  // Reputation Event operations
  listReputationEvents(userId: string): Promise<ReputationEvent[]>;
  createReputationEvent(event: InsertReputationEvent): Promise<ReputationEvent>;

  // Community Badge Progress operations
  getCommunityBadgeProgress(userId: string, badgeCategory: string): Promise<CommunityBadgeProgress | undefined>;
  listCommunityBadgeProgress(userId: string): Promise<CommunityBadgeProgress[]>;
  createCommunityBadgeProgress(progress: InsertCommunityBadgeProgress): Promise<CommunityBadgeProgress>;
  updateCommunityBadgeProgress(userId: string, badgeCategory: string, progress: Partial<InsertCommunityBadgeProgress>): Promise<CommunityBadgeProgress | undefined>;
}

export class MemStorage implements IStorage {
  private tenants = new Map<string, Tenant>();
  private roles = new Map<string, Role>();
  private plans = new Map<string, Plan>();
  private subscriptions = new Map<string, Subscription>();
  private payments = new Map<string, Payment>();
  private users = new Map<string, User>();
  private projects = new Map<string, Project>();
  private invoices = new Map<string, Invoice>();
  private leads = new Map<string, Lead>();
  private workOrders = new Map<string, WorkOrder>();
  private employees = new Map<string, Employee>();
  private mobileDevices = new Map<string, MobileDevice>();
  private offlineSyncQueue = new Map<string, OfflineSync>();
  private copilotConversations = new Map<string, CopilotConversation>();
  private copilotMessages = new Map<string, CopilotMessage>();
  private revenueForecasts = new Map<string, RevenueForecast>();
  private budgetAllocations = new Map<string, BudgetAllocation>();
  private timeSeriesData = new Map<string, TimeSeriesData>();
  private forecastModels = new Map<string, ForecastModel>();
  private scenarios = new Map<string, Scenario>();
  private scenarioVariables = new Map<string, ScenarioVariable>();
  private dashboardWidgets = new Map<string, DashboardWidget>();
  private reports = new Map<string, Report>();
  private auditLogs = new Map<string, AuditLog>();
  private apps = new Map<string, App>();
  private appReviews = new Map<string, AppReview>();
  private appInstallations = new Map<string, AppInstallation>();
  private connectors = new Map<string, Connector>();
  private connectorInstances = new Map<string, ConnectorInstance>();
  private webhookEvents = new Map<string, WebhookEvent>();
  private abacRules = new Map<string, AbacRule>();
  private encryptedFields = new Map<string, EncryptedField>();
  private complianceConfigs = new Map<string, ComplianceConfig>();
  private sprints = new Map<string, Sprint>();
  private issues = new Map<string, Issue>();
  private dataLakes = new Map<string, DataLake>();
  private etlPipelines = new Map<string, EtlPipeline>();
  private biDashboards = new Map<string, BiDashboard>();
  private fieldServiceJobs = new Map<string, FieldServiceJob>();
  private payrollConfigs = new Map<string, PayrollConfig>();
  private partners = new Map<string, Partner>();
  private userFeedbackStore = new Map<string, UserFeedback>();
  private industries = new Map<string, Industry>();
  private industryDeployments = new Map<string, IndustryDeployment>();

  // PHASE 1 Methods
  async getTenant(id: string) { return this.tenants.get(id); }
  async listTenants() { return Array.from(this.tenants.values()); }
  async createTenant(t: InsertTenant) { const id = randomUUID(); const tenant: Tenant = { id, ...t as any, createdAt: new Date() }; this.tenants.set(id, tenant); return tenant; }

  async getRole(id: string) { return this.roles.get(id); }
  async listRoles(tenantId?: string) { const list = Array.from(this.roles.values()); return tenantId ? list.filter(r => r.tenantId === tenantId) : list; }
  async createRole(r: InsertRole) { const id = randomUUID(); const role: Role = { id, ...r as any, createdAt: new Date() }; this.roles.set(id, role); return role; }

  async getPlan(id: string) { return this.plans.get(id); }
  async listPlans() { return Array.from(this.plans.values()); }
  async createPlan(p: InsertPlan) { const id = randomUUID(); const plan: Plan = { id, ...p as any, createdAt: new Date() }; this.plans.set(id, plan); return plan; }

  async getSubscription(id: string) { return this.subscriptions.get(id); }
  async listSubscriptions(tenantId?: string) { const list = Array.from(this.subscriptions.values()); return tenantId ? list.filter(s => s.tenantId === tenantId) : list; }
  async createSubscription(s: InsertSubscription) { const id = randomUUID(); const sub: Subscription = { id, ...s as any, createdAt: new Date() }; this.subscriptions.set(id, sub); return sub; }

  async getPayment(id: string) { return this.payments.get(id); }
  async listPayments(invoiceId?: string) { const list = Array.from(this.payments.values()); return invoiceId ? list.filter(p => p.invoiceId === invoiceId) : list; }
  async createPayment(p: InsertPayment) { const id = randomUUID(); const payment: Payment = { id, ...p as any, createdAt: new Date() }; this.payments.set(id, payment); return payment; }


  async getUser(id: string) { return this.users.get(id); }
  async getUserByEmail(email: string) { 
    return Array.from(this.users.values()).find(u => u.email === email); 
  }
  async listUsers() { return Array.from(this.users.values()); }
  async createUser(u: InsertUser) { const id = randomUUID(); const user: User = { id, ...u as any, createdAt: new Date() }; this.users.set(id, user); return user; }
  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = this.users.get(userData.id);
    if (existing) {
      const updated: User = { ...existing, ...userData, updatedAt: new Date() };
      this.users.set(userData.id, updated);
      return updated;
    }
    const user: User = { 
      id: userData.id, 
      email: userData.email ?? null, 
      password: null, 
      name: userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      role: "user", 
      permissions: null, 
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  async getProject(id: string) { return this.projects.get(id); }
  async listProjects(ownerId?: string) { const list = Array.from(this.projects.values()); return ownerId ? list.filter(p => p.ownerId === ownerId) : list; }
  async createProject(p: InsertProject) { const id = randomUUID(); const project: Project = { id, ...p, createdAt: new Date(), description: p.description ?? null }; this.projects.set(id, project); return project; }

  async getInvoice(id: string) { return this.invoices.get(id); }
  async listInvoices(customerId?: string) { const list = Array.from(this.invoices.values()); return customerId ? list.filter(i => i.customerId === customerId) : list; }
  async createInvoice(i: InsertInvoice) { const id = randomUUID(); const invoice: Invoice = { id, invoiceNumber: i.invoiceNumber, customerId: i.customerId ?? null, amount: i.amount, dueDate: i.dueDate ?? null, status: i.status ?? "draft", createdAt: new Date() }; this.invoices.set(id, invoice); return invoice; }

  async getLead(id: string) { return this.leads.get(id); }
  async listLeads() { return Array.from(this.leads.values()); }
  async createLead(l: InsertLead) { const id = randomUUID(); const lead: Lead = { id, name: l.name, email: l.email ?? null, company: l.company ?? null, score: l.score ? parseFloat(l.score) : 0, status: l.status ?? "new", createdAt: new Date() }; this.leads.set(id, lead); return lead; }

  async getWorkOrder(id: string) { return this.workOrders.get(id); }
  async listWorkOrders() { return Array.from(this.workOrders.values()); }
  async createWorkOrder(w: InsertWorkOrder) { const id = randomUUID(); const wo: WorkOrder = { id, title: w.title, status: w.status ?? null, description: w.description ?? null, assignedTo: w.assignedTo ?? null, dueDate: w.dueDate ?? null, createdAt: new Date() }; this.workOrders.set(id, wo); return wo; }

  async getEmployee(id: string) { return this.employees.get(id); }
  async listEmployees(department?: string) { const list = Array.from(this.employees.values()); return department ? list.filter(e => e.department === department) : list; }
  async createEmployee(e: InsertEmployee) { const id = randomUUID(); const emp: Employee = { id, name: e.name, email: e.email ?? null, department: e.department ?? null, role: e.role ?? null, salary: e.salary ? parseFloat(e.salary) : null, createdAt: new Date() }; this.employees.set(id, emp); return emp; }

  async getMobileDevice(id: string) { return this.mobileDevices.get(id); }
  async listMobileDevices(userId?: string) { const list = Array.from(this.mobileDevices.values()); return userId ? list.filter(d => d.userId === userId) : list; }
  async createMobileDevice(d: InsertMobileDevice) { const id = randomUUID(); const dev: MobileDevice = { id, userId: d.userId, deviceId: d.deviceId, platform: d.platform ?? null, lastSync: d.lastSync ?? null, createdAt: new Date() }; this.mobileDevices.set(id, dev); return dev; }
  async registerMobileDevice(d: InsertMobileDevice) { return this.createMobileDevice(d); }
  async updateMobileDeviceSync(deviceId: string) { return this.mobileDevices.get(deviceId); }

  async getOfflineSync(id: string) { return this.offlineSyncQueue.get(id); }
  async listOfflineSync(deviceId?: string) { const list = Array.from(this.offlineSyncQueue.values()); return deviceId ? list.filter(s => s.deviceId === deviceId) : list; }
  async createOfflineSync(s: InsertOfflineSync) { const id = randomUUID(); const sync: OfflineSync = { id, ...s, createdAt: new Date() }; this.offlineSyncQueue.set(id, sync); return sync; }
  async getOfflineSyncQueue(deviceId: string) { return this.listOfflineSync(deviceId); }
  async addToOfflineQueue(s: InsertOfflineSync) { return this.createOfflineSync(s); }

  async getCopilotConversation(id: string) { return this.copilotConversations.get(id); }
  async listCopilotConversations(userId?: string) { const list = Array.from(this.copilotConversations.values()); return userId ? list.filter(c => c.userId === userId) : list; }
  async createCopilotConversation(c: InsertCopilotConversation) { const id = randomUUID(); const conv: CopilotConversation = { id, ...c, createdAt: new Date() }; this.copilotConversations.set(id, conv); return conv; }

  async getCopilotMessage(id: string) { return this.copilotMessages.get(id); }
  async listCopilotMessages(conversationId?: string) { const list = Array.from(this.copilotMessages.values()); return conversationId ? list.filter(m => m.conversationId === conversationId) : list; }
  async createCopilotMessage(m: InsertCopilotMessage) { const id = randomUUID(); const msg: CopilotMessage = { id, conversationId: m.conversationId, role: m.role, content: m.content ?? null, createdAt: new Date() }; this.copilotMessages.set(id, msg); return msg; }

  async getRevenueForecast(id: string) { return this.revenueForecasts.get(id); }
  async listRevenueForecasts() { return Array.from(this.revenueForecasts.values()); }
  async createRevenueForecast(f: InsertRevenueForecast) { const id = randomUUID(); const forecast: RevenueForecast = { id, ...f as any, createdAt: new Date() }; this.revenueForecasts.set(id, forecast); return forecast; }

  async getBudgetAllocation(id: string) { return this.budgetAllocations.get(id); }
  async listBudgetAllocations(year?: number) { const list = Array.from(this.budgetAllocations.values()); return year ? list.filter(b => (b as any).year === year) : list; }
  async createBudgetAllocation(b: InsertBudgetAllocation) { const id = randomUUID(); const budget: BudgetAllocation = { id, ...b as any, createdAt: new Date() }; this.budgetAllocations.set(id, budget); return budget; }

  async getTimeSeriesData(id: string) { return Array.from(this.timeSeriesData.values()).filter(t => (t as any).metric === id)[0]; }
  async listTimeSeriesData() { return Array.from(this.timeSeriesData.values()); }
  async createTimeSeriesData(d: InsertTimeSeriesData) { const id = randomUUID(); const data: TimeSeriesData = { id, ...d as any, createdAt: new Date() }; this.timeSeriesData.set(id, data); return data; }

  async getForecastModel(id: string) { return this.forecastModels.get(id); }
  async listForecastModels() { return Array.from(this.forecastModels.values()); }
  async createForecastModel(m: InsertForecastModel) { const id = randomUUID(); const model: ForecastModel = { id, ...m, createdAt: new Date() }; this.forecastModels.set(id, model); return model; }

  async getScenario(id: string) { return this.scenarios.get(id); }
  async listScenarios() { return Array.from(this.scenarios.values()); }
  async createScenario(s: InsertScenario) { const id = randomUUID(); const scenario: Scenario = { id, ...s, createdAt: new Date() }; this.scenarios.set(id, scenario); return scenario; }

  async getScenarioVariable(id: string) { return this.scenarioVariables.get(id); }
  async listScenarioVariables(scenarioId?: string) { const list = Array.from(this.scenarioVariables.values()); return scenarioId ? list.filter(v => v.scenarioId === scenarioId) : list; }
  async createScenarioVariable(v: InsertScenarioVariable) { const id = randomUUID(); const variable: ScenarioVariable = { id, ...v as any, createdAt: new Date() }; this.scenarioVariables.set(id, variable); return variable; }
  async getScenarioVariables(scenarioId: string) { return this.listScenarioVariables(scenarioId); }
  async addScenarioVariable(v: InsertScenarioVariable) { return this.createScenarioVariable(v); }

  async getDashboardWidget(id: string) { return this.dashboardWidgets.get(id); }
  async listDashboardWidgets(dashboardId?: string) { const list = Array.from(this.dashboardWidgets.values()); return dashboardId ? list.filter(w => (w as any).dashboardId === dashboardId) : list; }
  async createDashboardWidget(w: InsertDashboardWidget) { const id = randomUUID(); const widget: DashboardWidget = { id, ...w, createdAt: new Date() }; this.dashboardWidgets.set(id, widget); return widget; }

  async getReport(id: string) { return this.reports.get(id); }
  async listReports() { return Array.from(this.reports.values()); }
  async createReport(r: InsertReport) { const id = randomUUID(); const report: Report = { id, ...r, createdAt: new Date() }; this.reports.set(id, report); return report; }

  async getAuditLog(id: string) { return this.auditLogs.get(id); }
  async listAuditLogs() { return Array.from(this.auditLogs.values()); }
  async createAuditLog(l: InsertAuditLog) { const id = randomUUID(); const log: AuditLog = { id, ...l, createdAt: new Date() }; this.auditLogs.set(id, log); return log; }

  async getApp(id: string) { return this.apps.get(id); }
  async listApps() { return Array.from(this.apps.values()); }
  async createApp(a: InsertApp) { const id = randomUUID(); const app: App = { id, ...a, createdAt: new Date() }; this.apps.set(id, app); return app; }

  async getAppReview(id: string) { return this.appReviews.get(id); }
  async listAppReviews(appId?: string) { const list = Array.from(this.appReviews.values()); return appId ? list.filter(r => r.appId === appId) : list; }
  async createAppReview(r: InsertAppReview) { const id = randomUUID(); const review: AppReview = { id, ...r, createdAt: new Date() }; this.appReviews.set(id, review); return review; }

  async getAppInstallation(id: string) { return this.appInstallations.get(id); }
  async listAppInstallations(userId?: string) { const list = Array.from(this.appInstallations.values()); return userId ? list.filter(i => i.userId === userId) : list; }
  async createAppInstallation(i: InsertAppInstallation) { const id = randomUUID(); const inst: AppInstallation = { id, ...i, createdAt: new Date() }; this.appInstallations.set(id, inst); return inst; }

  async getConnector(id: string) { return this.connectors.get(id); }
  async listConnectors() { return Array.from(this.connectors.values()); }
  async createConnector(c: InsertConnector) { const id = randomUUID(); const connector: Connector = { id, ...c, createdAt: new Date() }; this.connectors.set(id, connector); return connector; }

  async getConnectorInstance(id: string) { return this.connectorInstances.get(id); }
  async listConnectorInstances(userId?: string) { const list = Array.from(this.connectorInstances.values()); return userId ? list.filter(ci => ci.userId === userId) : list; }
  async createConnectorInstance(i: InsertConnectorInstance) { const id = randomUUID(); const instance: ConnectorInstance = { id, ...i, createdAt: new Date() }; this.connectorInstances.set(id, instance); return instance; }

  async getWebhookEvent(id: string) { return this.webhookEvents.get(id); }
  async listWebhookEvents() { return Array.from(this.webhookEvents.values()); }
  async createWebhookEvent(e: InsertWebhookEvent) { const id = randomUUID(); const event: WebhookEvent = { id, ...e, createdAt: new Date() }; this.webhookEvents.set(id, event); return event; }

  async getAbacRule(id: string) { return this.abacRules.get(id); }
  async listAbacRules() { return Array.from(this.abacRules.values()); }
  async createAbacRule(r: InsertAbacRule) { const id = randomUUID(); const rule: AbacRule = { id, ...r, createdAt: new Date() }; this.abacRules.set(id, rule); return rule; }

  async getEncryptedField(id: string) { return this.encryptedFields.get(id); }
  async listEncryptedFields() { return Array.from(this.encryptedFields.values()); }
  async createEncryptedField(f: InsertEncryptedField) { const id = randomUUID(); const field: EncryptedField = { id, ...f, createdAt: new Date() }; this.encryptedFields.set(id, field); return field; }

  async getComplianceConfig(id: string) { return this.complianceConfigs.get(id); }
  async listComplianceConfigs() { return Array.from(this.complianceConfigs.values()); }
  async createComplianceConfig(c: InsertComplianceConfig) { const id = randomUUID(); const cfg: ComplianceConfig = { id, ...c, createdAt: new Date() }; this.complianceConfigs.set(id, cfg); return cfg; }

  async getSprint(id: string) { return this.sprints.get(id); }
  async listSprints(projectId?: string) { const list = Array.from(this.sprints.values()); return projectId ? list.filter(s => s.projectId === projectId) : list; }
  async createSprint(s: InsertSprint) { const id = randomUUID(); const sprint: Sprint = { id, ...s, createdAt: new Date() }; this.sprints.set(id, sprint); return sprint; }

  async getIssue(id: string) { return this.issues.get(id); }
  async listIssues(sprintId?: string) { const list = Array.from(this.issues.values()); return sprintId ? list.filter(i => i.sprintId === sprintId) : list; }
  async createIssue(i: InsertIssue) { const id = randomUUID(); const issue: Issue = { id, ...i, createdAt: new Date() }; this.issues.set(id, issue); return issue; }

  async getDataLake(id: string) { return this.dataLakes.get(id); }
  async listDataLakes() { return Array.from(this.dataLakes.values()); }
  async createDataLake(l: InsertDataLake) { const id = randomUUID(); const lake: DataLake = { id, ...l, createdAt: new Date() }; this.dataLakes.set(id, lake); return lake; }

  async getEtlPipeline(id: string) { return this.etlPipelines.get(id); }
  async listEtlPipelines() { return Array.from(this.etlPipelines.values()); }
  async createEtlPipeline(p: InsertEtlPipeline) { const id = randomUUID(); const pipeline: EtlPipeline = { id, ...p, createdAt: new Date() }; this.etlPipelines.set(id, pipeline); return pipeline; }

  async getBiDashboard(id: string) { return this.biDashboards.get(id); }
  async listBiDashboards() { return Array.from(this.biDashboards.values()); }
  async createBiDashboard(d: InsertBiDashboard) { const id = randomUUID(); const dash: BiDashboard = { id, ...d, createdAt: new Date() }; this.biDashboards.set(id, dash); return dash; }

  async getFieldServiceJob(id: string) { return this.fieldServiceJobs.get(id); }
  async listFieldServiceJobs(status?: string) { const list = Array.from(this.fieldServiceJobs.values()); return status ? list.filter(j => j.status === status) : list; }
  async createFieldServiceJob(j: InsertFieldServiceJob) { const id = randomUUID(); const job: FieldServiceJob = { id, ...j, createdAt: new Date() }; this.fieldServiceJobs.set(id, job); return job; }

  async getPayrollConfig(id: string) { return this.payrollConfigs.get(id); }
  async listPayrollConfigs() { return Array.from(this.payrollConfigs.values()); }
  async createPayrollConfig(c: InsertPayrollConfig) { const id = randomUUID(); const cfg: PayrollConfig = { id, ...c, createdAt: new Date() }; this.payrollConfigs.set(id, cfg); return cfg; }

  // Demo Management
  private demos = new Map<string, Demo>();

  async getDemo(id: string) { return this.demos.get(id); }
  async listDemos() { return Array.from(this.demos.values()); }
  async createDemo(d: InsertDemo) { 
    const id = randomUUID(); 
    const demo: Demo = { 
      id, 
      ...d, 
      demoToken: `demo_${randomUUID()}`,
      createdAt: new Date(),
      expiresAt: d.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }; 
    this.demos.set(id, demo); 
    return demo; 
  }
  async deleteDemo(id: string) { 
    return this.demos.delete(id); 
  }
  async updateDemo(id: string, d: Partial<InsertDemo>) { 
    const demo = this.demos.get(id);
    if (!demo) return undefined;
    const updated: Demo = { ...demo, ...d };
    this.demos.set(id, updated);
    return updated;
  }

  // Partner Management
  async getPartner(id: string) { return this.partners.get(id); }
  async listPartners(filters?: { type?: string; tier?: string; isApproved?: boolean; search?: string }) { 
    let list = Array.from(this.partners.values());
    if (filters?.type) list = list.filter(p => p.type === filters.type);
    if (filters?.tier) list = list.filter(p => p.tier === filters.tier);
    if (filters?.isApproved !== undefined) list = list.filter(p => p.isApproved === filters.isApproved);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(s) || p.company.toLowerCase().includes(s));
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }
  async createPartner(p: InsertPartner) { 
    const id = randomUUID(); 
    const partner: Partner = { 
      id, 
      ...p, 
      type: p.type || "partner",
      tier: p.tier || "silver",
      isActive: p.isActive ?? true,
      isApproved: p.isApproved ?? false,
      createdAt: new Date(),
      updatedAt: new Date()
    }; 
    this.partners.set(id, partner); 
    return partner; 
  }
  async updatePartner(id: string, p: Partial<InsertPartner>) { 
    const partner = this.partners.get(id);
    if (!partner) return undefined;
    const updated: Partner = { ...partner, ...p, updatedAt: new Date() };
    this.partners.set(id, updated);
    return updated;
  }
  async deletePartner(id: string) { 
    return this.partners.delete(id); 
  }

  async getUserFeedback(id: string) { return this.userFeedbackStore.get(id); }
  async listUserFeedback() { return Array.from(this.userFeedbackStore.values()).sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()); }
  async createUserFeedback(f: InsertUserFeedback) { 
    const id = randomUUID(); 
    const feedback: UserFeedback = { 
      id, 
      ...f, 
      status: f.status || "new",
      priority: f.priority || "medium",
      createdAt: new Date(),
      updatedAt: new Date()
    }; 
    this.userFeedbackStore.set(id, feedback); 
    return feedback; 
  }

  // Industry Management
  async getIndustry(id: string) { return this.industries.get(id); }
  async listIndustries() { return Array.from(this.industries.values()); }
  async createIndustry(i: InsertIndustry) { 
    const id = randomUUID(); 
    const industry: Industry = { id, ...i as any, createdAt: new Date() }; 
    this.industries.set(id, industry); 
    return industry; 
  }

  // Industry Deployment Management
  async getIndustryDeployment(id: string) { return this.industryDeployments.get(id); }
  async listIndustryDeployments(tenantId?: string) { 
    const list = Array.from(this.industryDeployments.values()); 
    return tenantId ? list.filter(d => d.tenantId === tenantId) : list; 
  }
  async createIndustryDeployment(d: InsertIndustryDeployment) { 
    const id = randomUUID(); 
    const deployment: IndustryDeployment = { id, ...d as any, createdAt: new Date(), updatedAt: new Date() }; 
    this.industryDeployments.set(id, deployment); 
    return deployment; 
  }
  async updateIndustryDeployment(id: string, d: Partial<InsertIndustryDeployment>) { 
    const deployment = this.industryDeployments.get(id);
    if (!deployment) return undefined;
    const updated: IndustryDeployment = { ...deployment, ...d as any, updatedAt: new Date() };
    this.industryDeployments.set(id, updated);
    return updated;
  }
  async deleteIndustryDeployment(id: string) { 
    return this.industryDeployments.delete(id); 
  }

  // Community Space Management
  private communitySpaces = new Map<string, CommunitySpace>();
  private communityPosts = new Map<string, CommunityPost>();
  private communityComments = new Map<string, CommunityComment>();
  private communityVotes = new Map<string, CommunityVote>();
  private userTrustLevels = new Map<string, UserTrustLevel>();
  private reputationEventsStore = new Map<string, ReputationEvent>();
  private communityBadgeProgressStore = new Map<string, CommunityBadgeProgress>();

  async getCommunitySpace(id: string) { return this.communitySpaces.get(id); }
  async getCommunitySpaceBySlug(slug: string) { 
    return Array.from(this.communitySpaces.values()).find(s => s.slug === slug); 
  }
  async listCommunitySpaces() { 
    return Array.from(this.communitySpaces.values()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)); 
  }
  async createCommunitySpace(s: InsertCommunitySpace) { 
    const id = randomUUID(); 
    const space: CommunitySpace = { id, ...s as any, createdAt: new Date() }; 
    this.communitySpaces.set(id, space); 
    return space; 
  }

  async getCommunityPost(id: string) { return this.communityPosts.get(id); }
  async listCommunityPosts(spaceId?: string) { 
    const list = Array.from(this.communityPosts.values()); 
    const filtered = spaceId ? list.filter(p => p.spaceId === spaceId) : list;
    return filtered.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }
  async createCommunityPost(p: InsertCommunityPost) { 
    const id = randomUUID(); 
    const post: CommunityPost = { 
      id, 
      ...p as any, 
      upvotes: 0, 
      downvotes: 0, 
      viewCount: 0, 
      answerCount: 0,
      isPinned: false,
      isLocked: false,
      createdAt: new Date(), 
      updatedAt: new Date() 
    }; 
    this.communityPosts.set(id, post); 
    return post; 
  }
  async updateCommunityPost(id: string, p: Partial<InsertCommunityPost>) { 
    const post = this.communityPosts.get(id);
    if (!post) return undefined;
    const updated: CommunityPost = { ...post, ...p as any, updatedAt: new Date() };
    this.communityPosts.set(id, updated);
    return updated;
  }

  async getCommunityComment(id: string) { return this.communityComments.get(id); }
  async listCommunityComments(postId: string) { 
    return Array.from(this.communityComments.values())
      .filter(c => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }
  async createCommunityComment(c: InsertCommunityComment) { 
    const id = randomUUID(); 
    const comment: CommunityComment = { 
      id, 
      ...c as any, 
      upvotes: 0, 
      downvotes: 0, 
      isAccepted: false,
      createdAt: new Date(), 
      updatedAt: new Date() 
    }; 
    this.communityComments.set(id, comment); 
    return comment; 
  }

  async getCommunityVote(userId: string, targetType: string, targetId: string) { 
    return Array.from(this.communityVotes.values()).find(
      v => v.userId === userId && v.targetType === targetType && v.targetId === targetId
    ); 
  }
  async createCommunityVote(v: InsertCommunityVote) { 
    const id = randomUUID(); 
    const vote: CommunityVote = { id, ...v as any, createdAt: new Date() }; 
    this.communityVotes.set(id, vote); 
    return vote; 
  }
  async deleteCommunityVote(userId: string, targetType: string, targetId: string) { 
    const vote = await this.getCommunityVote(userId, targetType, targetId);
    if (vote) {
      this.communityVotes.delete(vote.id);
      return true;
    }
    return false;
  }

  async getUserTrustLevel(userId: string) { 
    return Array.from(this.userTrustLevels.values()).find(t => t.userId === userId); 
  }
  async createUserTrustLevel(t: InsertUserTrustLevel) { 
    const id = randomUUID(); 
    const trust: UserTrustLevel = { 
      id, 
      ...t as any, 
      trustLevel: 0,
      totalReputation: 0,
      postsToday: 0,
      answersToday: 0,
      spacesJoinedToday: 0,
      isShadowBanned: false,
      createdAt: new Date(), 
      updatedAt: new Date() 
    }; 
    this.userTrustLevels.set(id, trust); 
    return trust; 
  }
  async updateUserTrustLevel(userId: string, t: Partial<InsertUserTrustLevel>) { 
    const trust = await this.getUserTrustLevel(userId);
    if (!trust) return undefined;
    const updated: UserTrustLevel = { ...trust, ...t as any, updatedAt: new Date() };
    this.userTrustLevels.set(trust.id, updated);
    return updated;
  }

  async listReputationEvents(userId: string) { 
    return Array.from(this.reputationEventsStore.values())
      .filter(e => e.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }
  async createReputationEvent(e: InsertReputationEvent) { 
    const id = randomUUID(); 
    const event: ReputationEvent = { id, ...e as any, createdAt: new Date() }; 
    this.reputationEventsStore.set(id, event); 
    return event; 
  }

  async getCommunityBadgeProgress(userId: string, badgeCategory: string) { 
    return Array.from(this.communityBadgeProgressStore.values()).find(
      b => b.userId === userId && b.badgeCategory === badgeCategory
    ); 
  }
  async listCommunityBadgeProgress(userId: string) { 
    return Array.from(this.communityBadgeProgressStore.values()).filter(b => b.userId === userId);
  }
  async createCommunityBadgeProgress(p: InsertCommunityBadgeProgress) { 
    const id = randomUUID(); 
    const progress: CommunityBadgeProgress = { 
      id, 
      ...p as any, 
      currentCount: 0,
      currentLevel: "none",
      updatedAt: new Date() 
    }; 
    this.communityBadgeProgressStore.set(id, progress); 
    return progress; 
  }
  async updateCommunityBadgeProgress(userId: string, badgeCategory: string, p: Partial<InsertCommunityBadgeProgress>) { 
    const progress = await this.getCommunityBadgeProgress(userId, badgeCategory);
    if (!progress) return undefined;
    const updated: CommunityBadgeProgress = { ...progress, ...p as any, updatedAt: new Date() };
    this.communityBadgeProgressStore.set(progress.id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
