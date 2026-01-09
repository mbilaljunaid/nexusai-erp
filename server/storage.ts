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
  type Case, type InsertCase,
  type CaseComment, type InsertCaseComment,
  type Interaction, type InsertInteraction,
  type Account, type InsertAccount,
  type Contact, type InsertContact,
  type Opportunity, type InsertOpportunity,
  // Agentic AI
  type InsertAgentAction, type AgentAction,
  type InsertAgentExecution, type AgentExecution,
  type InsertAgentAuditLog, type AgentAuditLog,
  type GlAccount, type InsertGlAccount,
  type GlPeriod, type InsertGlPeriod,
  type GlJournal, type InsertGlJournal,
  type GlJournalLine, type InsertGlJournalLine,
  // Advanced GL (Phase 2 - Journals)
  type GlJournalBatch, type InsertGlJournalBatch,
  type GlJournalApproval, type InsertGlJournalApproval,
  // Advanced GL (Phase 2 - Architecture)
  type GlLedger, type InsertGlLedger,
  type GlSegment, type InsertGlSegment,
  type GlSegmentValue, type InsertGlSegmentValue,
  type GlCodeCombination, type InsertGlCodeCombination,
  type GlDailyRate, type InsertGlDailyRate,
  // Agentic AI
  type AiAction, type InsertAiAction,
  type AiAuditLog, type InsertAiAuditLog,
  // AP Module
  type ApSupplier, type InsertApSupplier,
  type ApInvoice, type InsertApInvoice,
  type ApPayment, type InsertApPayment,
  type ApApproval, type InsertApApproval,
  // AR Module
  type ArCustomer, type InsertArCustomer,
  type ArInvoice, type InsertArInvoice,
  type ArReceipt, type InsertArReceipt, type ArRevenueSchedule, type InsertArRevenueSchedule,
  // Cash Module
  type CashBankAccount, type InsertCashBankAccount,
  type CashStatementLine, type InsertCashStatementLine,
  type CashTransaction, type InsertCashTransaction,
  // Fixed Assets Module
  type FaAssetBook, type InsertFaAssetBook,
  type FaCategory, type InsertFaCategory,
  type FaAddition, type InsertFaAddition,
  type FaBook, type InsertFaBook,
  type FaTransactionHeader, type InsertFaTransactionHeader,
  type FaDepreciationSummary
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // AR Revenue Schedule operations
  listArRevenueSchedules(): Promise<ArRevenueSchedule[]>;
  getArRevenueSchedule(id: string): Promise<ArRevenueSchedule | undefined>;
  createArRevenueSchedule(data: InsertArRevenueSchedule): Promise<ArRevenueSchedule>;
  updateArRevenueSchedule(id: string, data: Partial<InsertArRevenueSchedule>): Promise<ArRevenueSchedule | undefined>;
  deleteArRevenueSchedule(id: string): Promise<boolean>;

  // Cash Management
  listCashBankAccounts(): Promise<CashBankAccount[]>;
  getCashBankAccount(id: string): Promise<CashBankAccount | undefined>;
  createCashBankAccount(data: InsertCashBankAccount): Promise<CashBankAccount>;
  updateCashBankAccount(id: string, data: Partial<InsertCashBankAccount>): Promise<CashBankAccount | undefined>;
  deleteCashBankAccount(id: string): Promise<boolean>;

  listCashStatementLines(bankAccountId: string): Promise<CashStatementLine[]>;
  createCashStatementLine(data: InsertCashStatementLine): Promise<CashStatementLine>;

  listCashTransactions(bankAccountId: string): Promise<CashTransaction[]>;
  createCashTransaction(data: InsertCashTransaction): Promise<CashTransaction>;

  // Fixed Assets
  listFaAssets(): Promise<FaAddition[]>;
  getFaAsset(id: string): Promise<FaAddition | undefined>;
  createFaAsset(data: InsertFaAddition): Promise<FaAddition>;
  createFaBook(data: InsertFaBook): Promise<FaBook>;
  listFaBooks(assetId: string): Promise<FaBook[]>;
  createFaTransaction(data: InsertFaTransactionHeader): Promise<FaTransactionHeader>;
  getFaCategory(id: string): Promise<FaCategory | undefined>;
  listFaCategories(): Promise<FaCategory[]>;

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
  // Case Management
  listCases(filters?: { accountId?: string; contactId?: string }): Promise<Case[]>;
  getCase(id: string): Promise<Case | undefined>;
  createCase(data: InsertCase): Promise<Case>;
  updateCase(id: string, data: Partial<InsertCase>): Promise<Case | undefined>;
  listCaseComments(caseId: string): Promise<CaseComment[]>;
  createCaseComment(data: InsertCaseComment): Promise<CaseComment>;

  // Interaction Methods
  listInteractions(entityType: string, entityId: string): Promise<Interaction[]>;
  createInteraction(interaction: InsertInteraction): Promise<Interaction>;

  // Lead Management
  getLead(id: string): Promise<Lead | undefined>;
  listLeads(): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  convertLead(leadId: string, ownerId?: string): Promise<{ account: Account; contact: Contact; opportunity: Opportunity }>;


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
  // Analytics
  getPipelineMetrics(): Promise<{ stage: string; count: number; value: number }[]>;
  getRevenueMetrics(): Promise<{ month: string; value: number }[]>;
  getLeadSourceMetrics(): Promise<{ source: string; count: number }[]>;
  getCaseMetrics(): Promise<{ status: string; priority: string; count: number }[]>;

  // Oracle Fusion Parity - Financials (GL)
  getGlAccount(id: string): Promise<GlAccount | undefined>;
  listGlAccounts(): Promise<GlAccount[]>;
  createGlAccount(account: InsertGlAccount): Promise<GlAccount>;

  getGlPeriod(id: string): Promise<GlPeriod | undefined>;
  listGlPeriods(): Promise<GlPeriod[]>;
  createGlPeriod(period: InsertGlPeriod): Promise<GlPeriod>;
  updateGlPeriod(id: string, updates: Partial<GlPeriod>): Promise<GlPeriod>;

  getGlJournal(id: string): Promise<GlJournal | undefined>;
  listGlJournals(periodId?: string): Promise<GlJournal[]>;
  createGlJournal(journal: InsertGlJournal): Promise<GlJournal>;

  listGlJournalLines(journalId: string): Promise<GlJournalLine[]>;
  createGlJournalLine(line: InsertGlJournalLine): Promise<GlJournalLine>;

  // Agentic AI Core
  getAiAction(actionName: string): Promise<AiAction | undefined>;
  listAiActions(): Promise<AiAction[]>;
  createAiAction(action: InsertAiAction): Promise<AiAction>;

  createAiAuditLog(log: InsertAiAuditLog): Promise<AiAuditLog>;
  listAiAuditLogs(limit?: number): Promise<AiAuditLog[]>;
  createGlJournalLine(line: InsertGlJournalLine): Promise<GlJournalLine>;

  // Advanced GL (Phase 2)
  getGlLedger(id: string): Promise<GlLedger | undefined>;
  listGlLedgers(): Promise<GlLedger[]>;
  createGlLedger(ledger: InsertGlLedger): Promise<GlLedger>;

  listGlSegments(ledgerId: string): Promise<GlSegment[]>;
  createGlSegment(segment: InsertGlSegment): Promise<GlSegment>;

  listGlSegmentValues(segmentId: string): Promise<GlSegmentValue[]>;
  createGlSegmentValue(val: InsertGlSegmentValue): Promise<GlSegmentValue>;

  getGlCodeCombination(id: string): Promise<GlCodeCombination | undefined>;
  createGlCodeCombination(cc: InsertGlCodeCombination): Promise<GlCodeCombination>;

  listGlDailyRates(fromCurrency: string, toCurrency: string, date: Date): Promise<GlDailyRate[]>;
  createGlDailyRate(rate: InsertGlDailyRate): Promise<GlDailyRate>;

  // AP Module
  listApSuppliers(): Promise<ApSupplier[]>;
  getApSupplier(id: string): Promise<ApSupplier | undefined>;
  createApSupplier(data: InsertApSupplier): Promise<ApSupplier>;
  updateApSupplier(id: string, data: Partial<InsertApSupplier>): Promise<ApSupplier | undefined>;
  deleteApSupplier(id: string): Promise<boolean>;

  listApInvoices(): Promise<ApInvoice[]>;
  getApInvoice(id: string): Promise<ApInvoice | undefined>;
  createApInvoice(data: InsertApInvoice): Promise<ApInvoice>;
  updateApInvoice(id: string, data: Partial<InsertApInvoice>): Promise<ApInvoice | undefined>;
  deleteApInvoice(id: string): Promise<boolean>;

  listApPayments(): Promise<ApPayment[]>;
  getApPayment(id: string): Promise<ApPayment | undefined>;
  createApPayment(data: InsertApPayment): Promise<ApPayment>;
  updateApPayment(id: string, data: Partial<InsertApPayment>): Promise<ApPayment | undefined>;
  deleteApPayment(id: string): Promise<boolean>;

  listApApprovals(): Promise<ApApproval[]>;
  getApApproval(id: string): Promise<ApApproval | undefined>;
  createApApproval(data: InsertApApproval): Promise<ApApproval>;
  updateApApproval(id: string, data: Partial<InsertApApproval>): Promise<ApApproval | undefined>;
  deleteApApproval(id: string): Promise<boolean>;

  // AR Module
  listArCustomers(): Promise<ArCustomer[]>;
  getArCustomer(id: string): Promise<ArCustomer | undefined>;
  createArCustomer(data: InsertArCustomer): Promise<ArCustomer>;
  updateArCustomer(id: string, data: Partial<InsertArCustomer>): Promise<ArCustomer | undefined>;
  deleteArCustomer(id: string): Promise<boolean>;

  listArInvoices(): Promise<ArInvoice[]>;
  getArInvoice(id: string): Promise<ArInvoice | undefined>;
  createArInvoice(data: InsertArInvoice): Promise<ArInvoice>;
  updateArInvoice(id: string, data: Partial<InsertArInvoice>): Promise<ArInvoice | undefined>;
  deleteArInvoice(id: string): Promise<boolean>;

  listArReceipts(): Promise<ArReceipt[]>;
  getArReceipt(id: string): Promise<ArReceipt | undefined>;
  createArReceipt(data: InsertArReceipt): Promise<ArReceipt>;
  updateArReceipt(id: string, r: Partial<InsertArReceipt>): Promise<ArReceipt | undefined>;
  deleteArReceipt(id: string): Promise<boolean>;
  updateArInvoiceStatus(id: string, status: string): Promise<ArInvoice | undefined>;

  // Agentic AI
  createAgentExecution(exec: InsertAgentExecution): Promise<AgentExecution>;
  updateAgentExecution(id: number, updates: Partial<AgentExecution>): Promise<AgentExecution>;
  createAgentAuditLog(log: InsertAgentAuditLog): Promise<AgentAuditLog>;
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
  private cases = new Map<string, Case>();
  private caseComments = new Map<string, CaseComment>();
  private interactions = new Map<string, Interaction>();
  private accounts = new Map<string, Account>();
  private contacts = new Map<string, Contact>();
  private opportunities = new Map<string, Opportunity>();

  // AP Maps
  private apSuppliers = new Map<string, ApSupplier>();
  private apInvoices = new Map<string, ApInvoice>();
  private apPayments = new Map<string, ApPayment>();
  private apApprovals = new Map<string, ApApproval>();

  // AR Maps
  private arCustomers = new Map<string, ArCustomer>();
  private arInvoices = new Map<string, ArInvoice>();
  private arReceipts = new Map<string, ArReceipt>();
  private arRevenueSchedules = new Map<string, ArRevenueSchedule>();

  private currentId = 1;
  private agentCurrentId = 1;

  // Agentic AI Maps
  private agentExecutions = new Map<number, AgentExecution>();
  private agentAuditLogs = new Map<number, AgentAuditLog>();

  // Cash Maps
  private cashBankAccounts = new Map<string, CashBankAccount>();
  private cashStatementLines = new Map<string, CashStatementLine>();
  private cashTransactions = new Map<string, CashTransaction>();

  // Fixed Asset Maps
  private faAssets = new Map<string, FaAddition>();
  private faAssetBooks = new Map<string, FaAssetBook>();
  private faBooks = new Map<string, FaBook>(); // Key: assetId-bookTypeCode
  private faCategories = new Map<string, FaCategory>();
  private faTransactions = new Map<string, FaTransactionHeader>();
  private faDepreciation = new Map<string, FaDepreciationSummary>();


  // GL Maps
  private glAccounts = new Map<string, GlAccount>();
  private glPeriods = new Map<string, GlPeriod>();
  private glJournals = new Map<string, GlJournal>();
  private glJournalLines = new Map<string, GlJournalLine>();

  // GL Implementation
  async getGlAccount(id: string) { return this.glAccounts.get(id); }
  async listGlAccounts() { return Array.from(this.glAccounts.values()); }
  async createGlAccount(a: InsertGlAccount) { const id = randomUUID(); const account: GlAccount = { id, ...a, parentAccountId: a.parentAccountId ?? null, isActive: a.isActive ?? true, createdAt: new Date() }; this.glAccounts.set(id, account); return account; }

  async getGlPeriod(id: string) { return this.glPeriods.get(id); }
  async listGlPeriods() { return Array.from(this.glPeriods.values()); }
  async createGlPeriod(p: InsertGlPeriod) { const id = randomUUID(); const period: GlPeriod = { id, ...p, status: p.status ?? "Open" }; this.glPeriods.set(id, period); return period; }
  async updateGlPeriod(id: string, updates: Partial<GlPeriod>) { const period = await this.getGlPeriod(id); if (!period) throw new Error("Period not found"); const updated = { ...period, ...updates }; this.glPeriods.set(id, updated); return updated; }

  async getGlJournal(id: string) { return this.glJournals.get(id); }
  async listGlJournals(periodId?: string) { const list = Array.from(this.glJournals.values()); return periodId ? list.filter(j => j.periodId === periodId) : list; }
  async createGlJournal(j: InsertGlJournal) { const id = randomUUID(); const journal: GlJournal = { id, ...j, periodId: j.periodId ?? null, description: j.description ?? null, source: j.source ?? "Manual", status: j.status ?? "Draft", postedDate: j.postedDate ?? null, createdBy: j.createdBy ?? null, batchId: j.batchId ?? null, approvalStatus: j.approvalStatus ?? "Not Required", reversalJournalId: j.reversalJournalId ?? null, createdAt: new Date() }; this.glJournals.set(id, journal); return journal; }

  async listGlJournalLines(journalId: string) { return Array.from(this.glJournalLines.values()).filter(l => l.journalId === journalId); }
  async createGlJournalLine(l: InsertGlJournalLine) { const id = randomUUID(); const line: GlJournalLine = { id, ...l, debit: l.debit ?? "0", credit: l.credit ?? "0", description: l.description ?? null }; this.glJournalLines.set(id, line); return line; }

  // Advanced GL (Batches & Approvals)
  async createGlJournalBatch(b: InsertGlJournalBatch) {
    const id = randomUUID();
    const batch: GlJournalBatch = {
      id,
      ...b,
      description: b.description ?? null,
      status: b.status ?? "Unposted",
      periodId: b.periodId ?? null,
      totalDebit: "0",
      totalCredit: "0",
      createdAt: new Date()
    };
    return batch;
  }
  async getGlJournalBatch(id: string) { return undefined; }
  async listGlJournalBatches() { return []; }
  async updateGlJournalBatch(id: string, b: Partial<InsertGlJournalBatch>) { return undefined; }

  async createGlJournalApproval(a: InsertGlJournalApproval) {
    const id = randomUUID();
    const approval: GlJournalApproval = {
      id,
      ...a,
      approverId: a.approverId ?? null,
      status: a.status ?? "Pending",
      comments: a.comments ?? null,
      actionDate: a.actionDate ?? null,
      createdAt: new Date()
    };
    return approval;
  }
  async listGlJournalApprovals(journalId: string) { return []; }
  async updateGlJournalApproval(id: string, a: Partial<InsertGlJournalApproval>) { return undefined; }

  // Advanced GL (Phase 2)
  async getGlLedger(id: string) { return undefined; }
  async listGlLedgers() { return []; }
  async createGlLedger(l: InsertGlLedger) {
    const id = randomUUID();
    return { id, ...l, currencyCode: l.currencyCode ?? "USD", ledgerCategory: l.ledgerCategory ?? "PRIMARY", isActive: l.isActive ?? true, description: l.description ?? null, calendarId: l.calendarId ?? null, coaId: l.coaId ?? null, createdAt: new Date() };
  }

  async listGlSegments(ledgerId: string) { return []; }
  async createGlSegment(s: InsertGlSegment) {
    const id = randomUUID();
    return { id, ...s, isRequired: s.isRequired ?? true, validationSource: s.validationSource ?? null, createdAt: new Date() };
  }

  async listGlSegmentValues(segmentId: string) { return []; }
  async createGlSegmentValue(v: InsertGlSegmentValue) {
    const id = randomUUID();
    return { id, ...v, description: v.description ?? null, parentValue: v.parentValue ?? null, enabled: v.enabled ?? true, startDate: v.startDate ?? null, endDate: v.endDate ?? null, createdAt: new Date() };
  }

  async getGlCodeCombination(id: string) { return undefined; }
  async createGlCodeCombination(cc: InsertGlCodeCombination) {
    const id = randomUUID();
    return { id, ...cc, segment1: cc.segment1 ?? null, segment2: cc.segment2 ?? null, segment3: cc.segment3 ?? null, segment4: cc.segment4 ?? null, segment5: cc.segment5 ?? null, accountType: cc.accountType ?? null, enabledFlag: cc.enabledFlag ?? true, startDateActive: cc.startDateActive ?? null, endDateActive: cc.endDateActive ?? null, summaryFlag: cc.summaryFlag ?? false };
  }

  async listGlDailyRates(from: string, to: string, date: Date) { return []; }
  async createGlDailyRate(r: InsertGlDailyRate) {
    const id = randomUUID();
    return { id, ...r, conversionType: r.conversionType ?? "Spot", createdAt: new Date() };
  }

  // AP Module Implementation
  async listApSuppliers() { return Array.from(this.apSuppliers.values()); }
  async getApSupplier(id: string) { return this.apSuppliers.get(id); }
  async createApSupplier(s: InsertApSupplier) {
    const id = randomUUID();
    const supplier: ApSupplier = { id, ...s, riskScore: s.riskScore ?? null, taxId: s.taxId ?? null, country: s.country ?? null, address: s.address ?? null, contactEmail: s.contactEmail ?? null, createdAt: new Date() };
    this.apSuppliers.set(id, supplier);
    return supplier;
  }
  async updateApSupplier(id: string, s: Partial<InsertApSupplier>) {
    const existing = this.apSuppliers.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...s }; this.apSuppliers.set(id, updated);
    return updated;
  }
  async deleteApSupplier(id: string) { return this.apSuppliers.delete(id); }

  async listApInvoices() { return Array.from(this.apInvoices.values()); }
  async getApInvoice(id: string) { return this.apInvoices.get(id); }
  async createApInvoice(i: InsertApInvoice) {
    const id = randomUUID();
    const invoice: ApInvoice = { id, ...i, currency: i.currency ?? "USD", dueDate: i.dueDate ?? null, status: i.status ?? "Draft", approvalStatus: i.approvalStatus ?? "Pending", glAccountId: i.glAccountId ?? null, description: i.description ?? null, createdAt: new Date() };
    this.apInvoices.set(id, invoice);
    return invoice;
  }
  async updateApInvoice(id: string, i: Partial<InsertApInvoice>) {
    const existing = this.apInvoices.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...i }; this.apInvoices.set(id, updated);
    return updated;
  }
  async deleteApInvoice(id: string) { return this.apInvoices.delete(id); }

  async listApPayments() { return Array.from(this.apPayments.values()); }
  async getApPayment(id: string) { return this.apPayments.get(id); }
  async createApPayment(p: InsertApPayment) {
    const id = randomUUID();
    const payment: ApPayment = { id, ...p, status: p.status ?? "Scheduled", scheduledDate: p.scheduledDate ?? null, paymentDate: p.paymentDate ?? null, transactionId: p.transactionId ?? null, createdAt: new Date() };
    this.apPayments.set(id, payment);
    return payment;
  }
  async updateApPayment(id: string, p: Partial<InsertApPayment>) {
    const existing = this.apPayments.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...p }; this.apPayments.set(id, updated);
    return updated;
  }
  async deleteApPayment(id: string) { return this.apPayments.delete(id); }

  async listApApprovals() { return Array.from(this.apApprovals.values()); }
  async getApApproval(id: string) { return this.apApprovals.get(id); }
  async createApApproval(a: InsertApApproval) {
    const id = randomUUID();
    const approval: ApApproval = { id, ...a, approverId: a.approverId ?? null, decision: a.decision ?? "Pending", comments: a.comments ?? null, actionDate: a.actionDate ?? null, createdAt: new Date() };
    this.apApprovals.set(id, approval);
    return approval;
  }
  async updateApApproval(id: string, a: Partial<InsertApApproval>) {
    const existing = this.apApprovals.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...a }; this.apApprovals.set(id, updated);
    return updated;
  }
  async deleteApApproval(id: string) { return this.apApprovals.delete(id); }

  // AR Module Implementation
  async listArCustomers() { return Array.from(this.arCustomers.values()); }
  async getArCustomer(id: string) { return this.arCustomers.get(id); }
  async createArCustomer(c: InsertArCustomer) {
    const id = randomUUID();
    const customer: ArCustomer = {
      id, ...c,
      taxId: c.taxId ?? null,
      customerType: c.customerType ?? "Commercial",
      creditLimit: c.creditLimit ?? "0",
      balance: c.balance ?? "0",
      address: c.address ?? null,
      contactEmail: c.contactEmail ?? null,
      creditHold: c.creditHold ?? false,
      riskCategory: c.riskCategory ?? "Low",
      parentCustomerId: c.parentCustomerId ?? null,
      status: c.status ?? "Active",
      createdAt: new Date()
    };
    this.arCustomers.set(id, customer);
    return customer;
  }
  async updateArCustomer(id: string, c: Partial<InsertArCustomer>) {
    const existing = this.arCustomers.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...c }; this.arCustomers.set(id, updated);
    return updated;
  }
  async deleteArCustomer(id: string) { return this.arCustomers.delete(id); }

  async listArInvoices() { return Array.from(this.arInvoices.values()); }
  async getArInvoice(id: string) { return this.arInvoices.get(id); }
  async createArInvoice(i: InsertArInvoice) {
    const id = randomUUID();
    const invoice: ArInvoice = {
      id, ...i,
      taxAmount: i.taxAmount ?? "0",
      currency: i.currency ?? "USD",
      dueDate: i.dueDate ?? null,
      status: i.status ?? "Draft",
      description: i.description ?? null,
      glAccountId: i.glAccountId ?? null,
      revenueScheduleId: i.revenueScheduleId ?? null,
      recognitionStatus: i.recognitionStatus ?? "Pending",
      createdAt: new Date()
    };
    this.arInvoices.set(id, invoice);
    return invoice;
  }
  async updateArInvoice(id: string, i: Partial<InsertArInvoice>) {
    const existing = this.arInvoices.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...i }; this.arInvoices.set(id, updated);
    return updated;
  }
  async deleteArInvoice(id: string) { return this.arInvoices.delete(id); }

  async updateArInvoiceStatus(id: string, status: string) {
    const inv = this.arInvoices.get(id);
    if (!inv) return undefined;
    inv.status = status;
    this.arInvoices.set(id, inv);
    return inv;
  }

  async listArReceipts() { return Array.from(this.arReceipts.values()); }
  async getArReceipt(id: string) { return this.arReceipts.get(id); }
  async createArReceipt(r: InsertArReceipt) {
    const id = this.currentId++;
    const receipt: ArReceipt = { id, ...r, invoiceId: r.invoiceId ?? null, receiptDate: r.receiptDate ?? null, paymentMethod: r.paymentMethod ?? null, transactionId: r.transactionId ?? null, status: r.status ?? "Completed", createdAt: new Date() };
    this.arReceipts.set(String(id), receipt);
    return receipt;
  }
  async updateArReceipt(id: string, r: Partial<InsertArReceipt>) {
    const existing = this.arReceipts.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...r }; this.arReceipts.set(id, updated);
    return updated;
  }
  async deleteArReceipt(id: string) { return this.arReceipts.delete(id); }

  // AR Revenue Schedule CRUD
  async listArRevenueSchedules() { return Array.from(this.arRevenueSchedules.values()); }
  async getArRevenueSchedule(id: string) { return this.arRevenueSchedules.get(id); }
  async createArRevenueSchedule(data: InsertArRevenueSchedule) {
    const id = this.currentId++;
    const schedule: ArRevenueSchedule = {
      id, ...data,
      amount: String(data.amount), // Cast number to numeric string
      status: data.status ?? "Pending"
    };
    this.arRevenueSchedules.set(String(id), schedule);
    return schedule;
  }
  async updateArRevenueSchedule(id: string, data: Partial<InsertArRevenueSchedule>) {
    const existing = this.arRevenueSchedules.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data } as ArRevenueSchedule;
    this.arRevenueSchedules.set(id, updated);
    return updated;
  }
  async deleteArRevenueSchedule(id: string) { return this.arRevenueSchedules.delete(id); }

  // Cash Management Implementation
  async listCashBankAccounts() { return Array.from(this.cashBankAccounts.values()); }
  async getCashBankAccount(id: string) { return this.cashBankAccounts.get(id); }
  async createCashBankAccount(data: InsertCashBankAccount) {
    const id = this.currentId++;
    const account: CashBankAccount = {
      id, ...data,
      currency: data.currency ?? "USD",
      currentBalance: data.currentBalance ? String(data.currentBalance) : "0",
      glAccountId: data.glAccountId ?? null,
      swiftCode: data.swiftCode ?? null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.cashBankAccounts.set(String(id), account);
    return account;
  }
  async updateCashBankAccount(id: string, data: Partial<InsertCashBankAccount>) {
    const existing = this.cashBankAccounts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, currentBalance: data.currentBalance ? String(data.currentBalance) : existing.currentBalance };
    this.cashBankAccounts.set(id, updated);
    return updated;
  }
  async deleteCashBankAccount(id: string) { return this.cashBankAccounts.delete(id); }

  async listCashStatementLines(bankAccountId: string) {
    return Array.from(this.cashStatementLines.values()).filter(l => String(l.bankAccountId) === bankAccountId);
  }
  async createCashStatementLine(data: InsertCashStatementLine) {
    const id = this.currentId++;
    const line: CashStatementLine = {
      id, ...data,
      amount: String(data.amount),
      description: data.description ?? null,
      referenceNumber: data.referenceNumber ?? null,
      reconciled: data.reconciled ?? false,
      createdAt: new Date()
    };
    this.cashStatementLines.set(String(id), line);
    return line;
  }

  async listCashTransactions(bankAccountId: string) {
    return Array.from(this.cashTransactions.values()).filter(t => String(t.bankAccountId) === bankAccountId);
  }
  async createCashTransaction(data: InsertCashTransaction) {
    const id = this.currentId++;
    const trx: CashTransaction = {
      id, ...data,
      amount: String(data.amount), // Cast
      transactionDate: data.transactionDate ? new Date(data.transactionDate) : new Date(),
      reference: data.reference ?? null,
      status: data.status ?? "Unreconciled"
    };
    this.cashTransactions.set(String(id), trx);
    return trx;
  }

  // Fixed Assets Implementation
  async listFaAssets() { return Array.from(this.faAssets.values()); }
  async getFaAsset(id: string) { return this.faAssets.get(id); }
  async createFaAsset(data: InsertFaAddition) {
    const id = this.currentId++;
    const asset: FaAddition = {
      id, ...data,
      tagNumber: data.tagNumber ?? null,
      manufacturer: data.manufacturer ?? null,
      model: data.model ?? null,
      serialNumber: data.serialNumber ?? null,
      salvageValue: data.salvageValue ? String(data.salvageValue) : "0",
      originalCost: String(data.originalCost),
      units: data.units ?? 1,
      status: "Active",
      location: data.location ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      datePlacedInService: data.datePlacedInService ? new Date(data.datePlacedInService) : new Date()
    };
    this.faAssets.set(String(id), asset);
    return asset;
  }
  async createFaBook(data: InsertFaBook) {
    const key = `${data.assetId}-${data.bookTypeCode}`;
    const book: FaBook = {
      ...data,
      cost: String(data.cost),
      ytdDepreciation: data.ytdDepreciation ? String(data.ytdDepreciation) : "0",
      depreciationReserve: data.depreciationReserve ? String(data.depreciationReserve) : "0",
      netBookValue: data.netBookValue ? String(data.netBookValue) : String(data.cost),
      depreciateFlag: data.depreciateFlag ?? true,
      datePlacedInService: data.datePlacedInService ? new Date(data.datePlacedInService) : new Date(),
      createdAt: new Date()
    };
    this.faBooks.set(key, book);
    return book;
  }
  async listFaBooks(assetId: string) {
    // Inefficient but fine for MemStorage demo
    return Array.from(this.faBooks.values()).filter(b => String(b.assetId) === assetId);
  }
  async createFaTransaction(data: InsertFaTransactionHeader) {
    const id = randomUUID();
    const trx: FaTransactionHeader = {
      id, ...data,
      transactionDate: data.transactionDate ? new Date(data.transactionDate) : new Date(),
      dateEffective: data.dateEffective ? new Date(data.dateEffective) : new Date(),
      amount: data.amount ? String(data.amount) : "0",
      comments: data.comments ?? null
    };
    this.faTransactions.set(id, trx);
    return trx;
  }
  async getFaCategory(id: string) { return this.faCategories.get(id); }
  async listFaCategories() { return Array.from(this.faCategories.values()); }

  // Agentic AI Implementation
  private aiActions = new Map<string, AiAction>();
  private aiAuditLogs = new Map<string, AiAuditLog>();

  async getAiAction(actionName: string) {
    return Array.from(this.aiActions.values()).find(a => a.actionName === actionName);
  }
  async listAiActions() { return Array.from(this.aiActions.values()); }
  async createAiAction(a: InsertAiAction) { const id = randomUUID(); const action: AiAction = { id, ...a, description: a.description ?? null, requiredPermissions: a.requiredPermissions ?? null, inputSchema: a.inputSchema ?? null, isEnabled: a.isEnabled ?? true, createdAt: new Date() }; this.aiActions.set(id, action); return action; }

  async createAiAuditLog(l: InsertAiAuditLog) { const id = randomUUID(); const log: AiAuditLog = { id, ...l, userId: l.userId ?? null, inputPrompt: l.inputPrompt ?? null, structuredIntent: l.structuredIntent ?? null, errorMessage: l.errorMessage ?? null, executionTimeMs: l.executionTimeMs ?? null, timestamp: new Date() }; this.aiAuditLogs.set(id, log); return log; }
  async listAiAuditLogs(limit = 100) { return Array.from(this.aiAuditLogs.values()).sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime()).slice(0, limit); }

  // Interaction Methods
  async listInteractions(entityType: string, entityId: string) {
    if (entityType === "lead") return []; // Stub
    if (entityType === "account") return []; // Stub
    if (entityType === "contact") return []; // Stub
    if (entityType === "opportunity") return []; // Stub
    return [];
  }
  async createInteraction(i: InsertInteraction) {
    // Stub implementation for MemStorage
    return {} as Interaction;
  }

  async convertLead(leadId: string, ownerId?: string): Promise<{ account: Account; contact: Contact; opportunity: Opportunity }> {
    // Stub implementation for MemStorage
    throw new Error("Lead conversion not supported in MemStorage");
  }

  // Analytics Stubs
  async getPipelineMetrics() { return []; }
  async getRevenueMetrics() { return []; }
  async getLeadSourceMetrics() { return []; }
  async getCaseMetrics() { return []; }

  async getAccount(id: string) { return this.accounts.get(id); }
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

  // Case Methods
  async listCases(filters?: { accountId?: string; contactId?: string }) {
    let cases = Array.from(this.cases.values());
    if (filters?.accountId) cases = cases.filter(c => c.accountId === filters.accountId);
    if (filters?.contactId) cases = cases.filter(c => c.contactId === filters.contactId);
    return cases;
  }
  async getCase(id: string) { return this.cases.get(id); }
  async createCase(data: InsertCase) {
    const id = randomUUID();
    const newCase: Case = {
      id,
      ...data,
      description: data.description ?? null,
      status: data.status ?? 'New',
      priority: data.priority ?? 'Medium',
      origin: data.origin ?? 'Web',
      accountId: data.accountId ?? null,
      contactId: data.contactId ?? null,
      userId: data.userId ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.cases.set(id, newCase);
    return newCase;
  }
  async updateCase(id: string, data: Partial<InsertCase>) {
    const existing = this.cases.get(id);
    if (!existing) return undefined;
    const updated: Case = { ...existing, ...data, updatedAt: new Date() };
    this.cases.set(id, updated);
    return updated;
  }
  async listCaseComments(caseId: string) {
    return Array.from(this.caseComments.values()).filter(c => c.caseId === caseId);
  }
  async createCaseComment(data: InsertCaseComment) {
    const id = randomUUID();
    const comment: CaseComment = {
      id,
      ...data,
      isPublic: data.isPublic ?? false,
      createdById: data.createdById ?? null,
      createdAt: new Date()
    };
    this.caseComments.set(id, comment);
    return comment;
  }

  async getLead(id: string) { return this.leads.get(id); }
  async listLeads() { return Array.from(this.leads.values()); }
  async createLead(l: InsertLead) {
    const id = randomUUID();
    const lead: Lead = {
      id,
      name: l.name,
      firstName: l.firstName ?? null,
      lastName: l.lastName ?? l.name.split(' ').pop() ?? "", // Fallback
      salutation: l.salutation ?? null,
      title: l.title ?? null,
      company: l.company ?? null,

      email: l.email ?? null,
      phone: l.phone ?? null,
      mobilePhone: l.mobilePhone ?? null,
      website: l.website ?? null,

      street: l.street ?? null,
      city: l.city ?? null,
      state: l.state ?? null,
      postalCode: l.postalCode ?? null,
      country: l.country ?? null,

      leadSource: l.leadSource ?? null,
      status: l.status ?? "new",
      industry: l.industry ?? null,
      rating: l.rating ?? null,
      annualRevenue: l.annualRevenue ? String(l.annualRevenue) : null,
      numberOfEmployees: l.numberOfEmployees ?? null,

      score: l.score ?? "0",
      isConverted: 0,
      convertedDate: null,
      convertedAccountId: null,
      convertedContactId: null,
      convertedOpportunityId: null,

      description: l.description ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: l.ownerId ?? null
    };
    this.leads.set(id, lead);
    return lead;
  }

  async getWorkOrder(id: string) { return this.workOrders.get(id); }
  async listWorkOrders() { return Array.from(this.workOrders.values()); }
  async createWorkOrder(w: InsertWorkOrder) { const id = randomUUID(); const wo: WorkOrder = { id, title: w.title, status: w.status ?? null, description: w.description ?? null, assignedTo: w.assignedTo ?? null, dueDate: w.dueDate ?? null, createdAt: new Date() }; this.workOrders.set(id, wo); return wo; }

  async getEmployee(id: string) { return this.employees.get(id); }
  async listEmployees(department?: string) { const list = Array.from(this.employees.values()); return department ? list.filter(e => e.department === department) : list; }
  async createEmployee(e: InsertEmployee) { const id = randomUUID(); const emp: Employee = { id, firstName: e.firstName, lastName: e.lastName, email: e.email ?? null, department: e.department ?? null, hireDate: e.hireDate ?? null, status: e.status ?? "active", createdAt: new Date() }; this.employees.set(id, emp); return emp; }

  async getMobileDevice(id: string) { return this.mobileDevices.get(id); }
  async listMobileDevices(userId?: string) { const list = Array.from(this.mobileDevices.values()); return userId ? list.filter(d => d.userId === userId) : list; }
  async createMobileDevice(d: InsertMobileDevice) { const id = randomUUID(); const dev: MobileDevice = { id, userId: d.userId, deviceId: d.deviceId, deviceName: d.deviceName ?? null, platform: d.platform ?? null, pushToken: d.pushToken ?? null, lastSyncAt: d.lastSyncAt ?? null, createdAt: new Date(), updatedAt: new Date(), isActive: d.isActive ?? true }; this.mobileDevices.set(id, dev); return dev; }
  async registerMobileDevice(d: InsertMobileDevice) { return this.createMobileDevice(d); }
  async updateMobileDeviceSync(deviceId: string) { return this.mobileDevices.get(deviceId); }

  async getOfflineSync(id: string) { return this.offlineSyncQueue.get(id); }
  async listOfflineSync(deviceId?: string) { const list = Array.from(this.offlineSyncQueue.values()); return deviceId ? list.filter(s => s.deviceId === deviceId) : list; }
  async createOfflineSync(s: InsertOfflineSync) { const id = randomUUID(); const sync: OfflineSync = { id, deviceId: s.deviceId, entityType: s.entityType, entityId: s.entityId, action: s.action, data: s.data ?? null, syncStatus: s.syncStatus ?? "pending", syncedAt: s.syncedAt ?? null, createdAt: new Date() }; this.offlineSyncQueue.set(id, sync); return sync; }
  async getOfflineSyncQueue(deviceId: string) { return this.listOfflineSync(deviceId); }
  async addToOfflineQueue(s: InsertOfflineSync) { return this.createOfflineSync(s); }

  async getCopilotConversation(id: string) { return this.copilotConversations.get(id); }
  async listCopilotConversations(userId?: string) { const list = Array.from(this.copilotConversations.values()); return userId ? list.filter(c => c.userId === userId) : list; }
  async createCopilotConversation(c: InsertCopilotConversation) { const id = randomUUID(); const conv: CopilotConversation = { id, userId: c.userId, title: c.title ?? null, status: c.status ?? "active", createdAt: new Date(), updatedAt: new Date() }; this.copilotConversations.set(id, conv); return conv; }

  async getCopilotMessage(id: string) { return this.copilotMessages.get(id); }
  async listCopilotMessages(conversationId?: string) { const list = Array.from(this.copilotMessages.values()); return conversationId ? list.filter(m => m.conversationId === conversationId) : list; }
  async createCopilotMessage(m: InsertCopilotMessage) { const id = randomUUID(); const msg: CopilotMessage = { id, conversationId: m.conversationId, role: m.role ?? null, content: m.content, createdAt: new Date() }; this.copilotMessages.set(id, msg); return msg; }

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
  async createForecastModel(m: InsertForecastModel) { const id = randomUUID(); const model: ForecastModel = { id, name: m.name, type: m.type, isActive: m.isActive ?? true, parameters: m.parameters ?? null, accuracy: m.accuracy ?? null, createdAt: new Date(), updatedAt: new Date() }; this.forecastModels.set(id, model); return model; }

  async getScenario(id: string) { return this.scenarios.get(id); }
  async listScenarios() { return Array.from(this.scenarios.values()); }
  async createScenario(s: InsertScenario) { const id = randomUUID(); const scenario: Scenario = { id, name: s.name, description: s.description ?? null, status: s.status ?? "active", type: s.type ?? null, baselineId: s.baselineId ?? null, createdAt: new Date(), updatedAt: new Date() }; this.scenarios.set(id, scenario); return scenario; }

  async getScenarioVariable(id: string) { return this.scenarioVariables.get(id); }
  async listScenarioVariables(scenarioId?: string) { const list = Array.from(this.scenarioVariables.values()); return scenarioId ? list.filter(v => v.scenarioId === scenarioId) : list; }
  async createScenarioVariable(v: InsertScenarioVariable) { const id = randomUUID(); const variable: ScenarioVariable = { id, ...v as any, createdAt: new Date() }; this.scenarioVariables.set(id, variable); return variable; }
  async getScenarioVariables(scenarioId: string) { return this.listScenarioVariables(scenarioId); }
  async addScenarioVariable(v: InsertScenarioVariable) { return this.createScenarioVariable(v); }

  async getDashboardWidget(id: string) { return this.dashboardWidgets.get(id); }
  async listDashboardWidgets(dashboardId?: string) { const list = Array.from(this.dashboardWidgets.values()); return dashboardId ? list.filter(w => (w as any).dashboardId === dashboardId) : list; }
  async createDashboardWidget(w: InsertDashboardWidget) { const id = randomUUID(); const widget: DashboardWidget = { id, userId: w.userId, widgetType: w.widgetType, title: w.title, config: w.config ?? null, position: w.position ?? 0, size: w.size ?? "medium", isVisible: w.isVisible ?? true, createdAt: new Date(), updatedAt: new Date() }; this.dashboardWidgets.set(id, widget); return widget; }

  async getReport(id: string) { return this.reports.get(id); }
  async listReports() { return Array.from(this.reports.values()); }
  async createReport(r: InsertReport) { const id = randomUUID(); const report: Report = { id, name: r.name, description: r.description ?? null, type: r.type ?? null, category: r.category ?? null, config: r.config ?? null, module: r.module ?? null, isFavorite: r.isFavorite ?? false, isPublic: r.isPublic ?? false, createdBy: r.createdBy ?? null, lastRunAt: r.lastRunAt ?? null, createdAt: new Date(), updatedAt: new Date() }; this.reports.set(id, report); return report; }

  async getAuditLog(id: string) { return this.auditLogs.get(id); }
  async listAuditLogs() { return Array.from(this.auditLogs.values()); }
  async createAuditLog(l: InsertAuditLog) { const id = randomUUID(); const log: AuditLog = { id, userId: l.userId ?? null, action: l.action, entityType: l.entityType ?? null, entityId: l.entityId ?? null, oldValue: l.oldValue ?? null, newValue: l.newValue ?? null, ipAddress: l.ipAddress ?? null, userAgent: l.userAgent ?? null, createdAt: new Date() }; this.auditLogs.set(id, log); return log; }

  async getApp(id: string) { return this.apps.get(id); }
  async listApps() { return Array.from(this.apps.values()); }
  async createApp(a: InsertApp) { const id = randomUUID(); const app: App = { id, name: a.name, description: a.description ?? null, status: a.status ?? "active", version: a.version ?? "1.0.0", createdAt: new Date(), updatedAt: new Date() }; this.apps.set(id, app); return app; }

  async getAppReview(id: string) { return this.appReviews.get(id); }
  async listAppReviews(appId?: string) { const list = Array.from(this.appReviews.values()); return appId ? list.filter(r => r.appId === appId) : list; }
  async createAppReview(r: InsertAppReview) { const id = randomUUID(); const review: AppReview = { id, appId: r.appId, userId: r.userId, rating: r.rating, title: r.title ?? null, content: r.content ?? null, createdAt: new Date() }; this.appReviews.set(id, review); return review; }

  async getAppInstallation(id: string) { return this.appInstallations.get(id); }
  async listAppInstallations(userId?: string) { const list = Array.from(this.appInstallations.values()); return userId ? list.filter(i => i.installedBy === userId) : list; }
  async createAppInstallation(i: InsertAppInstallation) { const id = randomUUID(); const inst: AppInstallation = { id, tenantId: i.tenantId, appId: i.appId, status: i.status ?? "active", installedBy: i.installedBy, installedAt: new Date() }; this.appInstallations.set(id, inst); return inst; }

  async getConnector(id: string) { return this.connectors.get(id); }
  async listConnectors() { return Array.from(this.connectors.values()); }
  async createConnector(c: InsertConnector) { const id = randomUUID(); const connector: Connector = { id, name: c.name, type: c.type, status: c.status ?? "active", config: c.config ?? null, createdAt: new Date(), updatedAt: new Date() }; this.connectors.set(id, connector); return connector; }

  async getConnectorInstance(id: string) { return this.connectorInstances.get(id); }
  async listConnectorInstances(userId?: string) { return Array.from(this.connectorInstances.values()); }
  async createConnectorInstance(i: InsertConnectorInstance) { const id = randomUUID(); const instance: ConnectorInstance = { id, connectorId: i.connectorId, tenantId: i.tenantId, status: i.status ?? "active", config: i.config ?? null, credentials: i.credentials ?? null, lastSyncAt: i.lastSyncAt ?? null, createdAt: new Date(), updatedAt: new Date() }; this.connectorInstances.set(id, instance); return instance; }

  async getWebhookEvent(id: string) { return this.webhookEvents.get(id); }
  async listWebhookEvents() { return Array.from(this.webhookEvents.values()); }
  async createWebhookEvent(e: InsertWebhookEvent) { const id = randomUUID(); const event: WebhookEvent = { id, connectorInstanceId: e.connectorInstanceId, eventType: e.eventType, payload: e.payload ?? null, status: e.status ?? "pending", processedAt: e.processedAt ?? null, createdAt: new Date() }; this.webhookEvents.set(id, event); return event; }

  async getAbacRule(id: string) { return this.abacRules.get(id); }
  async listAbacRules() { return Array.from(this.abacRules.values()); }
  async createAbacRule(r: InsertAbacRule) { const id = randomUUID(); const rule: AbacRule = { id, name: r.name, action: r.action, resource: r.resource, conditions: r.conditions ?? null, effect: r.effect ?? "allow", priority: r.priority ?? 0, isActive: r.isActive ?? true, createdAt: new Date(), updatedAt: new Date() }; this.abacRules.set(id, rule); return rule; }

  async getEncryptedField(id: string) { return this.encryptedFields.get(id); }
  async listEncryptedFields() { return Array.from(this.encryptedFields.values()); }
  async createEncryptedField(f: InsertEncryptedField) { const id = randomUUID(); const field: EncryptedField = { id, entityType: f.entityType, entityId: f.entityId, fieldName: f.fieldName, encryptedValue: f.encryptedValue ?? null, keyVersion: f.keyVersion ?? null, createdAt: new Date(), updatedAt: new Date() }; this.encryptedFields.set(id, field); return field; }

  async getComplianceConfig(id: string) { return this.complianceConfigs.get(id); }
  async listComplianceConfigs() { return Array.from(this.complianceConfigs.values()); }
  async createComplianceConfig(c: InsertComplianceConfig) { const id = randomUUID(); const cfg: ComplianceConfig = { id, tenantId: c.tenantId, framework: c.framework, settings: c.settings ?? null, isActive: c.isActive ?? true, createdAt: new Date(), updatedAt: new Date() }; this.complianceConfigs.set(id, cfg); return cfg; }

  async getSprint(id: string) { return this.sprints.get(id); }
  async listSprints(projectId?: string) { const list = Array.from(this.sprints.values()); return projectId ? list.filter(s => s.projectId === projectId) : list; }
  async createSprint(s: InsertSprint) { const id = randomUUID(); const sprint: Sprint = { id, name: s.name, projectId: s.projectId, status: s.status ?? "planned", startDate: s.startDate ?? null, endDate: s.endDate ?? null, goal: s.goal ?? null, velocity: s.velocity ?? null, createdAt: new Date(), updatedAt: new Date() }; this.sprints.set(id, sprint); return sprint; }

  async getIssue(id: string) { return this.issues.get(id); }
  async listIssues(sprintId?: string) { const list = Array.from(this.issues.values()); return sprintId ? list.filter(i => i.sprintId === sprintId) : list; }
  async createIssue(i: InsertIssue) { const id = randomUUID(); const issue: Issue = { id, title: i.title, projectId: i.projectId, sprintId: i.sprintId ?? null, description: i.description ?? null, status: i.status ?? "open", type: i.type ?? "task", priority: i.priority ?? "medium", assigneeId: i.assigneeId ?? null, reporterId: i.reporterId ?? null, storyPoints: i.storyPoints ?? null, dueDate: i.dueDate ?? null, createdAt: new Date(), updatedAt: new Date() }; this.issues.set(id, issue); return issue; }

  async getDataLake(id: string) { return this.dataLakes.get(id); }
  async listDataLakes() { return Array.from(this.dataLakes.values()); }
  async createDataLake(l: InsertDataLake) { const id = randomUUID(); const lake: DataLake = { id, name: l.name, description: l.description ?? null, storageType: l.storageType ?? null, connectionConfig: l.connectionConfig ?? null, status: l.status ?? "active", createdAt: new Date(), updatedAt: new Date() }; this.dataLakes.set(id, lake); return lake; }

  async getEtlPipeline(id: string) { return this.etlPipelines.get(id); }
  async listEtlPipelines() { return Array.from(this.etlPipelines.values()); }
  async createEtlPipeline(p: InsertEtlPipeline) { const id = randomUUID(); const pipeline: EtlPipeline = { id, name: p.name, description: p.description ?? null, sourceConfig: p.sourceConfig ?? null, transformConfig: p.transformConfig ?? null, destinationConfig: p.destinationConfig ?? null, schedule: p.schedule ?? null, status: p.status ?? "active", lastRunAt: p.lastRunAt ?? null, createdAt: new Date(), updatedAt: new Date() }; this.etlPipelines.set(id, pipeline); return pipeline; }

  async getBiDashboard(id: string) { return this.biDashboards.get(id); }
  async listBiDashboards() { return Array.from(this.biDashboards.values()); }
  async createBiDashboard(d: InsertBiDashboard) { const id = randomUUID(); const dash: BiDashboard = { id, name: d.name, description: d.description ?? null, layout: d.layout ?? null, widgets: d.widgets ?? null, filters: d.filters ?? null, isPublic: d.isPublic ?? false, createdBy: d.createdBy ?? null, createdAt: new Date(), updatedAt: new Date() }; this.biDashboards.set(id, dash); return dash; }

  async getFieldServiceJob(id: string) { return this.fieldServiceJobs.get(id); }
  async listFieldServiceJobs(status?: string) { const list = Array.from(this.fieldServiceJobs.values()); return status ? list.filter(j => j.status === status) : list; }
  async createFieldServiceJob(j: InsertFieldServiceJob) { const id = randomUUID(); const job: FieldServiceJob = { id, jobNumber: j.jobNumber, customerId: j.customerId ?? null, technicianId: j.technicianId ?? null, status: j.status ?? "scheduled", priority: j.priority ?? "medium", jobType: j.jobType ?? null, scheduledDate: j.scheduledDate ?? null, completedDate: j.completedDate ?? null, location: j.location ?? null, notes: j.notes ?? null, createdAt: new Date(), updatedAt: new Date() }; this.fieldServiceJobs.set(id, job); return job; }

  async getPayrollConfig(id: string) { return this.payrollConfigs.get(id); }
  async listPayrollConfigs() { return Array.from(this.payrollConfigs.values()); }
  async createPayrollConfig(c: InsertPayrollConfig) { const id = randomUUID(); const cfg: PayrollConfig = { id, tenantId: c.tenantId, payPeriod: c.payPeriod ?? "monthly", payDay: c.payDay ?? null, taxSettings: c.taxSettings ?? null, benefitSettings: c.benefitSettings ?? null, overtimeRules: c.overtimeRules ?? null, isActive: c.isActive ?? true, createdAt: new Date(), updatedAt: new Date() }; this.payrollConfigs.set(id, cfg); return cfg; }

  // Demo Management
  private demos = new Map<string, Demo>();

  async getDemo(id: string) { return this.demos.get(id); }
  async listDemos() { return Array.from(this.demos.values()); }
  async createDemo(d: InsertDemo) {
    const id = randomUUID();
    const demo: Demo = {
      id,
      ...d,
      status: d.status ?? "active",
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
      name: p.name,
      email: p.email,
      company: p.company ?? "Unknown",
      description: p.description ?? null,
      website: p.website ?? null,
      phone: p.phone ?? null,
      type: p.type || "partner",
      tier: p.tier || "silver",
      isActive: p.isActive ?? true,
      isApproved: p.isApproved ?? false,
      logo: p.logo ?? null,
      specializations: p.specializations ?? null,
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
      userId: f.userId ?? null,
      category: f.category ?? null,
      attachmentUrl: f.attachmentUrl ?? null,
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

  // Agentic AI Implementation
  async createAgentExecution(exec: InsertAgentExecution): Promise<AgentExecution> {
    const id = this.agentCurrentId++;
    const newExec: AgentExecution = {
      ...exec,
      id,
      actionCode: exec.actionCode || null,
      status: exec.status || "PENDING",
      confidenceScore: exec.confidenceScore || "0",
      executedBy: exec.executedBy || "system",
      createdAt: new Date(),
      completedAt: null,
      errorMessage: null,
      parameters: exec.parameters || {}
    };
    this.agentExecutions.set(id, newExec);
    return newExec;
  }

  async updateAgentExecution(id: number, updates: Partial<AgentExecution>): Promise<AgentExecution> {
    const existing = this.agentExecutions.get(id);
    if (!existing) throw new Error("Execution not found");
    const updated = { ...existing, ...updates };
    this.agentExecutions.set(id, updated);
    return updated;
  }

  async createAgentAuditLog(log: InsertAgentAuditLog): Promise<AgentAuditLog> {
    const id = this.agentCurrentId++;
    const newLog: AgentAuditLog = {
      ...log,
      id,
      createdAt: new Date(),
      dataSnapshot: log.dataSnapshot || null,
      executionId: log.executionId || null
    };
    this.agentAuditLogs.set(id, newLog);
    return newLog;
  }
}

export const storage = new MemStorage();
