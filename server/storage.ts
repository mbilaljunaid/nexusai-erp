import {
  type User, type InsertUser,
  type Bom, type InsertBom,
  type BomLine, type InsertBomLine,
  type WorkOrder, type InsertWorkOrder,
  type ProductionOrder, type InsertProductionOrder,
  type QualityCheck, type InsertQualityCheck,
  type Routing, type InsertRouting,
  type RoutingOperation, type InsertRoutingOperation,
  type WorkCenter, type InsertWorkCenter,
  type MrpForecast, type InsertMrpForecast,
  type ReplenishmentRule, type InsertReplenishmentRule,
  type Warehouse, type InsertWarehouse,
  type StockLocation, type InsertStockLocation,
  type StockMove, type InsertStockMove,
  type Maintenance, type InsertMaintenance,
  type ProductionCost, type InsertProductionCost,
  type TaxRule, type InsertTaxRule,
  type ConsolidationRule, type InsertConsolidationRule,
  type FxTranslation, type InsertFxTranslation,
  type LeadScore, type InsertLeadScore,
  type CpqPricingRule, type InsertCpqPricingRule,
  type Territory, type InsertTerritory,
  type BenefitsPlan, type InsertBenefitsPlan,
  type PayrollConfig, type InsertPayrollConfig,
  type SuccessionPlan, type InsertSuccessionPlan,
  type LearningPath, type InsertLearningPath,
  type CompensationPlan, type InsertCompensationPlan,
  type CopilotConversation, type InsertCopilotConversation,
  type CopilotMessage, type InsertCopilotMessage,
  type MobileDevice, type InsertMobileDevice,
  type OfflineSync, type InsertOfflineSync,
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
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getBom(id: string): Promise<Bom | undefined>;
  listBoms(): Promise<Bom[]>;
  createBom(bom: InsertBom): Promise<Bom>;
  updateBom(id: string, bom: Partial<InsertBom>): Promise<Bom | undefined>;

  getBomLines(bomId: string): Promise<BomLine[]>;
  addBomLine(line: InsertBomLine): Promise<BomLine>;

  getWorkOrder(id: string): Promise<WorkOrder | undefined>;
  listWorkOrders(): Promise<WorkOrder[]>;
  createWorkOrder(wo: InsertWorkOrder): Promise<WorkOrder>;

  getProductionOrder(id: string): Promise<ProductionOrder | undefined>;
  listProductionOrders(): Promise<ProductionOrder[]>;
  createProductionOrder(po: InsertProductionOrder): Promise<ProductionOrder>;

  getQualityCheck(id: string): Promise<QualityCheck | undefined>;
  listQualityChecks(workOrderId?: string): Promise<QualityCheck[]>;
  createQualityCheck(qc: InsertQualityCheck): Promise<QualityCheck>;

  getRouting(id: string): Promise<Routing | undefined>;
  listRoutings(): Promise<Routing[]>;
  createRouting(routing: InsertRouting): Promise<Routing>;

  getRoutingOperations(routingId: string): Promise<RoutingOperation[]>;
  addRoutingOperation(op: InsertRoutingOperation): Promise<RoutingOperation>;

  getWorkCenter(id: string): Promise<WorkCenter | undefined>;
  listWorkCenters(): Promise<WorkCenter[]>;
  createWorkCenter(wc: InsertWorkCenter): Promise<WorkCenter>;

  getMrpForecast(id: string): Promise<MrpForecast | undefined>;
  listMrpForecasts(): Promise<MrpForecast[]>;
  createMrpForecast(forecast: InsertMrpForecast): Promise<MrpForecast>;

  getReplenishmentRule(id: string): Promise<ReplenishmentRule | undefined>;
  listReplenishmentRules(): Promise<ReplenishmentRule[]>;
  createReplenishmentRule(rule: InsertReplenishmentRule): Promise<ReplenishmentRule>;

  getWarehouse(id: string): Promise<Warehouse | undefined>;
  listWarehouses(): Promise<Warehouse[]>;
  createWarehouse(wh: InsertWarehouse): Promise<Warehouse>;

  getStockLocation(id: string): Promise<StockLocation | undefined>;
  listStockLocations(warehouseId?: string): Promise<StockLocation[]>;
  createStockLocation(loc: InsertStockLocation): Promise<StockLocation>;

  getStockMove(id: string): Promise<StockMove | undefined>;
  listStockMoves(): Promise<StockMove[]>;
  createStockMove(move: InsertStockMove): Promise<StockMove>;

  getMaintenance(id: string): Promise<Maintenance | undefined>;
  listMaintenance(workCenterId?: string): Promise<Maintenance[]>;
  createMaintenance(maint: InsertMaintenance): Promise<Maintenance>;

  getProductionCost(id: string): Promise<ProductionCost | undefined>;
  listProductionCosts(productionOrderId?: string): Promise<ProductionCost[]>;
  createProductionCost(cost: InsertProductionCost): Promise<ProductionCost>;

  getTaxRule(id: string): Promise<TaxRule | undefined>;
  listTaxRules(): Promise<TaxRule[]>;
  createTaxRule(rule: InsertTaxRule): Promise<TaxRule>;

  getConsolidationRule(id: string): Promise<ConsolidationRule | undefined>;
  listConsolidationRules(): Promise<ConsolidationRule[]>;
  createConsolidationRule(rule: InsertConsolidationRule): Promise<ConsolidationRule>;

  getFxTranslation(id: string): Promise<FxTranslation | undefined>;
  listFxTranslations(): Promise<FxTranslation[]>;
  createFxTranslation(trans: InsertFxTranslation): Promise<FxTranslation>;

  getLeadScore(id: string): Promise<LeadScore | undefined>;
  listLeadScores(): Promise<LeadScore[]>;
  createLeadScore(score: InsertLeadScore): Promise<LeadScore>;

  getCpqPricingRule(id: string): Promise<CpqPricingRule | undefined>;
  listCpqPricingRules(): Promise<CpqPricingRule[]>;
  createCpqPricingRule(rule: InsertCpqPricingRule): Promise<CpqPricingRule>;

  getTerritory(id: string): Promise<Territory | undefined>;
  listTerritories(): Promise<Territory[]>;
  createTerritory(territory: InsertTerritory): Promise<Territory>;

  getBenefitsPlan(id: string): Promise<BenefitsPlan | undefined>;
  listBenefitsPlans(): Promise<BenefitsPlan[]>;
  createBenefitsPlan(plan: InsertBenefitsPlan): Promise<BenefitsPlan>;

  getPayrollConfig(id: string): Promise<PayrollConfig | undefined>;
  listPayrollConfigs(): Promise<PayrollConfig[]>;
  createPayrollConfig(config: InsertPayrollConfig): Promise<PayrollConfig>;

  getSuccessionPlan(id: string): Promise<SuccessionPlan | undefined>;
  listSuccessionPlans(): Promise<SuccessionPlan[]>;
  createSuccessionPlan(plan: InsertSuccessionPlan): Promise<SuccessionPlan>;

  getLearningPath(id: string): Promise<LearningPath | undefined>;
  listLearningPaths(): Promise<LearningPath[]>;
  createLearningPath(path: InsertLearningPath): Promise<LearningPath>;

  getCompensationPlan(id: string): Promise<CompensationPlan | undefined>;
  listCompensationPlans(): Promise<CompensationPlan[]>;
  createCompensationPlan(plan: InsertCompensationPlan): Promise<CompensationPlan>;

  getCopilotConversation(id: string): Promise<CopilotConversation | undefined>;
  listCopilotConversations(userId?: string): Promise<CopilotConversation[]>;
  createCopilotConversation(conv: InsertCopilotConversation): Promise<CopilotConversation>;

  getCopilotMessage(id: string): Promise<CopilotMessage | undefined>;
  listCopilotMessages(conversationId: string): Promise<CopilotMessage[]>;
  createCopilotMessage(msg: InsertCopilotMessage): Promise<CopilotMessage>;

  getMobileDevice(id: string): Promise<MobileDevice | undefined>;
  listMobileDevices(userId?: string): Promise<MobileDevice[]>;
  registerMobileDevice(device: InsertMobileDevice): Promise<MobileDevice>;
  updateMobileDeviceSync(deviceId: string): Promise<MobileDevice | undefined>;

  getOfflineSyncQueue(deviceId: string): Promise<OfflineSync[]>;
  addToOfflineQueue(sync: InsertOfflineSync): Promise<OfflineSync>;
  markSyncAsComplete(syncId: string): Promise<OfflineSync | undefined>;

  getRevenueForecast(id: string): Promise<RevenueForecast | undefined>;
  listRevenueForecasts(): Promise<RevenueForecast[]>;
  createRevenueForecast(forecast: InsertRevenueForecast): Promise<RevenueForecast>;

  getBudgetAllocation(id: string): Promise<BudgetAllocation | undefined>;
  listBudgetAllocations(year?: number): Promise<BudgetAllocation[]>;
  createBudgetAllocation(budget: InsertBudgetAllocation): Promise<BudgetAllocation>;

  getTimeSeriesData(metric: string): Promise<TimeSeriesData[]>;
  createTimeSeriesData(data: InsertTimeSeriesData): Promise<TimeSeriesData>;

  getForecastModel(id: string): Promise<ForecastModel | undefined>;
  listForecastModels(): Promise<ForecastModel[]>;
  createForecastModel(model: InsertForecastModel): Promise<ForecastModel>;

  getScenario(id: string): Promise<Scenario | undefined>;
  listScenarios(): Promise<Scenario[]>;
  createScenario(scenario: InsertScenario): Promise<Scenario>;

  getScenarioVariables(scenarioId: string): Promise<ScenarioVariable[]>;
  addScenarioVariable(variable: InsertScenarioVariable): Promise<ScenarioVariable>;

  getDashboardWidget(id: string): Promise<DashboardWidget | undefined>;
  listDashboardWidgets(dashboardId: string): Promise<DashboardWidget[]>;
  createDashboardWidget(widget: InsertDashboardWidget): Promise<DashboardWidget>;

  getReport(id: string): Promise<Report | undefined>;
  listReports(): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;

  getAuditLog(id: string): Promise<AuditLog | undefined>;
  listAuditLogs(userId?: string): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;

  getApp(id: string): Promise<App | undefined>;
  listApps(category?: string): Promise<App[]>;
  createApp(app: InsertApp): Promise<App>;

  getAppReview(id: string): Promise<AppReview | undefined>;
  listAppReviews(appId: string): Promise<AppReview[]>;
  createAppReview(review: InsertAppReview): Promise<AppReview>;

  getAppInstallation(id: string): Promise<AppInstallation | undefined>;
  listAppInstallations(tenantId: string): Promise<AppInstallation[]>;
  createAppInstallation(installation: InsertAppInstallation): Promise<AppInstallation>;

  getConnector(id: string): Promise<Connector | undefined>;
  listConnectors(type?: string): Promise<Connector[]>;
  createConnector(connector: InsertConnector): Promise<Connector>;

  getConnectorInstance(id: string): Promise<ConnectorInstance | undefined>;
  listConnectorInstances(tenantId: string): Promise<ConnectorInstance[]>;
  createConnectorInstance(instance: InsertConnectorInstance): Promise<ConnectorInstance>;

  getWebhookEvent(id: string): Promise<WebhookEvent | undefined>;
  listWebhookEvents(appId: string): Promise<WebhookEvent[]>;
  createWebhookEvent(event: InsertWebhookEvent): Promise<WebhookEvent>;

  getAbacRule(id: string): Promise<AbacRule | undefined>;
  listAbacRules(resource?: string): Promise<AbacRule[]>;
  createAbacRule(rule: InsertAbacRule): Promise<AbacRule>;

  getEncryptedField(id: string): Promise<EncryptedField | undefined>;
  listEncryptedFields(entityType?: string): Promise<EncryptedField[]>;
  createEncryptedField(field: InsertEncryptedField): Promise<EncryptedField>;

  getComplianceConfig(id: string): Promise<ComplianceConfig | undefined>;
  listComplianceConfigs(tenantId?: string): Promise<ComplianceConfig[]>;
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
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private boms = new Map<string, Bom>();
  private bomLines = new Map<string, BomLine>();
  private workOrders = new Map<string, WorkOrder>();
  private productionOrders = new Map<string, ProductionOrder>();
  private qualityChecks = new Map<string, QualityCheck>();
  private routings = new Map<string, Routing>();
  private routingOperations = new Map<string, RoutingOperation>();
  private workCenters = new Map<string, WorkCenter>();
  private mrpForecasts = new Map<string, MrpForecast>();
  private replenishmentRules = new Map<string, ReplenishmentRule>();
  private warehouses = new Map<string, Warehouse>();
  private stockLocations = new Map<string, StockLocation>();
  private stockMoves = new Map<string, StockMove>();
  private maintenanceRecords = new Map<string, Maintenance>();
  private productionCosts = new Map<string, ProductionCost>();
  private taxRules = new Map<string, TaxRule>();
  private consolidationRules = new Map<string, ConsolidationRule>();
  private fxTranslations = new Map<string, FxTranslation>();
  private leadScores = new Map<string, LeadScore>();
  private cpqPricingRules = new Map<string, CpqPricingRule>();
  private territories = new Map<string, Territory>();
  private benefitsPlans = new Map<string, BenefitsPlan>();
  private payrollConfigs = new Map<string, PayrollConfig>();
  private successionPlans = new Map<string, SuccessionPlan>();
  private learningPaths = new Map<string, LearningPath>();
  private compensationPlans = new Map<string, CompensationPlan>();

  async getUser(id: string) { return this.users.get(id); }
  async getUserByUsername(username: string) { return Array.from(this.users.values()).find(u => u.username === username); }
  async createUser(u: InsertUser) { const id = randomUUID(); const user = { ...u, id }; this.users.set(id, user); return user; }

  async getBom(id: string) { return this.boms.get(id); }
  async listBoms() { return Array.from(this.boms.values()); }
  async createBom(b: InsertBom) { const id = randomUUID(); const bom: Bom = { id, ...b, quantity: String(b.quantity), yield: b.yield ?? "100", createdAt: new Date() }; this.boms.set(id, bom); return bom; }
  async updateBom(id: string, b: Partial<InsertBom>) { const e = this.boms.get(id); if (!e) return; const u: Bom = { ...e, ...b, quantity: String(b.quantity ?? e.quantity) }; this.boms.set(id, u); return u; }

  async getBomLines(bomId: string) { return Array.from(this.bomLines.values()).filter(l => l.bomId === bomId); }
  async addBomLine(l: InsertBomLine) { const id = randomUUID(); const line: BomLine = { id, ...l, quantity: String(l.quantity), scrapPercentage: l.scrapPercentage ?? "0" }; this.bomLines.set(id, line); return line; }

  async getWorkOrder(id: string) { return this.workOrders.get(id); }
  async listWorkOrders() { return Array.from(this.workOrders.values()); }
  async createWorkOrder(w: InsertWorkOrder) { const id = randomUUID(); const wo: WorkOrder = { id, woNumber: `WO-${Date.now()}`, ...w, quantity: String(w.quantity), createdAt: new Date() }; this.workOrders.set(id, wo); return wo; }

  async getProductionOrder(id: string) { return this.productionOrders.get(id); }
  async listProductionOrders() { return Array.from(this.productionOrders.values()); }
  async createProductionOrder(p: InsertProductionOrder) { const id = randomUUID(); const po: ProductionOrder = { id, poNumber: `PO-${Date.now()}`, ...p, quantity: String(p.quantity), createdAt: new Date() }; this.productionOrders.set(id, po); return po; }

  async getQualityCheck(id: string) { return this.qualityChecks.get(id); }
  async listQualityChecks(wId?: string) { const checks = Array.from(this.qualityChecks.values()); return wId ? checks.filter(q => q.workOrderId === wId) : checks; }
  async createQualityCheck(q: InsertQualityCheck) { const id = randomUUID(); const qc: QualityCheck = { id, ...q, quantity: String(q.quantity), quantityPassed: String(q.quantityPassed), quantityFailed: q.quantityFailed ?? "0", checkDate: new Date() }; this.qualityChecks.set(id, qc); return qc; }

  async getRouting(id: string) { return this.routings.get(id); }
  async listRoutings() { return Array.from(this.routings.values()); }
  async createRouting(r: InsertRouting) { const id = randomUUID(); const routing: Routing = { id, ...r, createdAt: new Date() }; this.routings.set(id, routing); return routing; }

  async getRoutingOperations(rId: string) { return Array.from(this.routingOperations.values()).filter(o => o.routingId === rId); }
  async addRoutingOperation(o: InsertRoutingOperation) { const id = randomUUID(); const op: RoutingOperation = { id, ...o, cycleTime: String(o.cycleTime), setupTime: o.setupTime ?? "0" }; this.routingOperations.set(id, op); return op; }

  async getWorkCenter(id: string) { return this.workCenters.get(id); }
  async listWorkCenters() { return Array.from(this.workCenters.values()); }
  async createWorkCenter(w: InsertWorkCenter) { const id = randomUUID(); const wc: WorkCenter = { id, ...w, capacity: String(w.capacity), costPerHour: String(w.costPerHour) }; this.workCenters.set(id, wc); return wc; }

  async getMrpForecast(id: string) { return this.mrpForecasts.get(id); }
  async listMrpForecasts() { return Array.from(this.mrpForecasts.values()); }
  async createMrpForecast(f: InsertMrpForecast) { const id = randomUUID(); const forecast: MrpForecast = { id, ...f, quantity: String(f.quantity), createdAt: new Date() }; this.mrpForecasts.set(id, forecast); return forecast; }

  async getReplenishmentRule(id: string) { return this.replenishmentRules.get(id); }
  async listReplenishmentRules() { return Array.from(this.replenishmentRules.values()); }
  async createReplenishmentRule(r: InsertReplenishmentRule) { const id = randomUUID(); const rule: ReplenishmentRule = { id, ...r, minStock: String(r.minStock), maxStock: String(r.maxStock), reorderQuantity: String(r.reorderQuantity) }; this.replenishmentRules.set(id, rule); return rule; }

  async getWarehouse(id: string) { return this.warehouses.get(id); }
  async listWarehouses() { return Array.from(this.warehouses.values()); }
  async createWarehouse(w: InsertWarehouse) { const id = randomUUID(); const wh: Warehouse = { id, ...w }; this.warehouses.set(id, wh); return wh; }

  async getStockLocation(id: string) { return this.stockLocations.get(id); }
  async listStockLocations(wId?: string) { const locs = Array.from(this.stockLocations.values()); return wId ? locs.filter(l => l.warehouseId === wId) : locs; }
  async createStockLocation(l: InsertStockLocation) { const id = randomUUID(); const loc: StockLocation = { id, ...l }; this.stockLocations.set(id, loc); return loc; }

  async getStockMove(id: string) { return this.stockMoves.get(id); }
  async listStockMoves() { return Array.from(this.stockMoves.values()); }
  async createStockMove(m: InsertStockMove) { const id = randomUUID(); const move: StockMove = { id, moveNumber: `SM-${Date.now()}`, ...m, quantity: String(m.quantity), moveDate: new Date() }; this.stockMoves.set(id, move); return move; }

  async getMaintenance(id: string) { return this.maintenanceRecords.get(id); }
  async listMaintenance(wId?: string) { const records = Array.from(this.maintenanceRecords.values()); return wId ? records.filter(r => r.workCenterId === wId) : records; }
  async createMaintenance(m: InsertMaintenance) { const id = randomUUID(); const maint: Maintenance = { id, maintenanceNumber: `MNT-${Date.now()}`, ...m, createdAt: new Date() }; this.maintenanceRecords.set(id, maint); return maint; }

  async getProductionCost(id: string) { return this.productionCosts.get(id); }
  async listProductionCosts(pId?: string) { const costs = Array.from(this.productionCosts.values()); return pId ? costs.filter(c => c.productionOrderId === pId) : costs; }
  async createProductionCost(c: InsertProductionCost) { const id = randomUUID(); const cost: ProductionCost = { id, ...c, amount: String(c.amount), recordedDate: new Date() }; this.productionCosts.set(id, cost); return cost; }

  async getTaxRule(id: string) { return this.taxRules.get(id); }
  async listTaxRules() { return Array.from(this.taxRules.values()); }
  async createTaxRule(r: InsertTaxRule) { const id = randomUUID(); const rule: TaxRule = { id, ...r, rate: String(r.rate), createdAt: new Date() }; this.taxRules.set(id, rule); return rule; }

  async getConsolidationRule(id: string) { return this.consolidationRules.get(id); }
  async listConsolidationRules() { return Array.from(this.consolidationRules.values()); }
  async createConsolidationRule(r: InsertConsolidationRule) { const id = randomUUID(); const rule: ConsolidationRule = { id, ...r, ownershipPercentage: String(r.ownershipPercentage) }; this.consolidationRules.set(id, rule); return rule; }

  async getFxTranslation(id: string) { return this.fxTranslations.get(id); }
  async listFxTranslations() { return Array.from(this.fxTranslations.values()); }
  async createFxTranslation(t: InsertFxTranslation) { const id = randomUUID(); const trans: FxTranslation = { id, ...t, transactionAmount: String(t.transactionAmount), exchangeRate: String(t.exchangeRate), translatedAmount: String(t.translatedAmount), recordedDate: new Date() }; this.fxTranslations.set(id, trans); return trans; }

  async getLeadScore(id: string) { return this.leadScores.get(id); }
  async listLeadScores() { return Array.from(this.leadScores.values()); }
  async createLeadScore(s: InsertLeadScore) { const id = randomUUID(); const score: LeadScore = { id, ...s, score: String(s.score), probability: String(s.probability), updatedDate: new Date() }; this.leadScores.set(id, score); return score; }

  async getCpqPricingRule(id: string) { return this.cpqPricingRules.get(id); }
  async listCpqPricingRules() { return Array.from(this.cpqPricingRules.values()); }
  async createCpqPricingRule(r: InsertCpqPricingRule) { const id = randomUUID(); const rule: CpqPricingRule = { id, ...r }; this.cpqPricingRules.set(id, rule); return rule; }

  async getTerritory(id: string) { return this.territories.get(id); }
  async listTerritories() { return Array.from(this.territories.values()); }
  async createTerritory(t: InsertTerritory) { const id = randomUUID(); const territory: Territory = { id, ...t, quota: String(t.quota) }; this.territories.set(id, territory); return territory; }

  async getBenefitsPlan(id: string) { return this.benefitsPlans.get(id); }
  async listBenefitsPlans() { return Array.from(this.benefitsPlans.values()); }
  async createBenefitsPlan(p: InsertBenefitsPlan) { const id = randomUUID(); const plan: BenefitsPlan = { id, ...p }; this.benefitsPlans.set(id, plan); return plan; }

  async getPayrollConfig(id: string) { return this.payrollConfigs.get(id); }
  async listPayrollConfigs() { return Array.from(this.payrollConfigs.values()); }
  async createPayrollConfig(c: InsertPayrollConfig) { const id = randomUUID(); const config: PayrollConfig = { id, ...c }; this.payrollConfigs.set(id, config); return config; }

  async getSuccessionPlan(id: string) { return this.successionPlans.get(id); }
  async listSuccessionPlans() { return Array.from(this.successionPlans.values()); }
  async createSuccessionPlan(p: InsertSuccessionPlan) { const id = randomUUID(); const plan: SuccessionPlan = { id, ...p }; this.successionPlans.set(id, plan); return plan; }

  async getLearningPath(id: string) { return this.learningPaths.get(id); }
  async listLearningPaths() { return Array.from(this.learningPaths.values()); }
  async createLearningPath(p: InsertLearningPath) { const id = randomUUID(); const path: LearningPath = { id, ...p, progressPercent: String(p.progressPercent ?? "0") }; this.learningPaths.set(id, path); return path; }

  async getCompensationPlan(id: string) { return this.compensationPlans.get(id); }
  async listCompensationPlans() { return Array.from(this.compensationPlans.values()); }
  async createCompensationPlan(p: InsertCompensationPlan) { const id = randomUUID(); const plan: CompensationPlan = { id, ...p, baseSalary: String(p.baseSalary) }; this.compensationPlans.set(id, plan); return plan; }

  private copilotConversations = new Map<string, CopilotConversation>();
  private copilotMessages = new Map<string, CopilotMessage>();
  private mobileDevices = new Map<string, MobileDevice>();
  private offlineSyncQueue = new Map<string, OfflineSync>();

  async getCopilotConversation(id: string) { return this.copilotConversations.get(id); }
  async listCopilotConversations(userId?: string) { const convs = Array.from(this.copilotConversations.values()); return userId ? convs.filter(c => c.userId === userId) : convs; }
  async createCopilotConversation(c: InsertCopilotConversation) { const id = randomUUID(); const conv: CopilotConversation = { id, ...c, messageCount: 0, createdAt: new Date(), updatedAt: new Date() }; this.copilotConversations.set(id, conv); return conv; }

  async getCopilotMessage(id: string) { return this.copilotMessages.get(id); }
  async listCopilotMessages(convId: string) { return Array.from(this.copilotMessages.values()).filter(m => m.conversationId === convId).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()); }
  async createCopilotMessage(m: InsertCopilotMessage) { const id = randomUUID(); const msg: CopilotMessage = { id, ...m, createdAt: new Date() }; this.copilotMessages.set(id, msg); const conv = this.copilotConversations.get(m.conversationId); if (conv) { conv.messageCount = (conv.messageCount || 0) + 1; conv.updatedAt = new Date(); } return msg; }

  async getMobileDevice(id: string) { return this.mobileDevices.get(id); }
  async listMobileDevices(userId?: string) { const devices = Array.from(this.mobileDevices.values()); return userId ? devices.filter(d => d.userId === userId) : devices; }
  async registerMobileDevice(d: InsertMobileDevice) { const id = randomUUID(); const device: MobileDevice = { id, ...d, createdAt: new Date() }; this.mobileDevices.set(id, device); return device; }
  async updateMobileDeviceSync(deviceId: string) { const device = this.mobileDevices.get(deviceId); if (device) { device.lastSyncDate = new Date(); } return device; }

  async getOfflineSyncQueue(deviceId: string) { return Array.from(this.offlineSyncQueue.values()).filter(s => s.deviceId === deviceId && s.status === "pending"); }
  async addToOfflineQueue(s: InsertOfflineSync) { const id = randomUUID(); const sync: OfflineSync = { id, ...s, createdAt: new Date() }; this.offlineSyncQueue.set(id, sync); return sync; }
  async markSyncAsComplete(syncId: string) { const sync = this.offlineSyncQueue.get(syncId); if (sync) { sync.status = "synced"; sync.syncedAt = new Date(); } return sync; }

  private revenueForecasts = new Map<string, RevenueForecast>();
  private budgetAllocations = new Map<string, BudgetAllocation>();
  private timeSeriesDataMap = new Map<string, TimeSeriesData[]>();
  private forecastModels = new Map<string, ForecastModel>();
  private scenarios = new Map<string, Scenario>();
  private scenarioVariables = new Map<string, ScenarioVariable>();
  private dashboardWidgets = new Map<string, DashboardWidget>();
  private reports = new Map<string, Report>();
  private auditLogs = new Map<string, AuditLog>();

  async getRevenueForecast(id: string) { return this.revenueForecasts.get(id); }
  async listRevenueForecasts() { return Array.from(this.revenueForecasts.values()); }
  async createRevenueForecast(f: InsertRevenueForecast) { const id = randomUUID(); const forecast: RevenueForecast = { id, ...f, baselineRevenue: String(f.baselineRevenue), forecastRevenue: String(f.forecastRevenue), createdAt: new Date() }; this.revenueForecasts.set(id, forecast); return forecast; }

  async getBudgetAllocation(id: string) { return this.budgetAllocations.get(id); }
  async listBudgetAllocations(year?: number) { const budgets = Array.from(this.budgetAllocations.values()); return year ? budgets.filter(b => b.year === year) : budgets; }
  async createBudgetAllocation(b: InsertBudgetAllocation) { const id = randomUUID(); const budget: BudgetAllocation = { id, ...b, budgetAmount: String(b.budgetAmount), allocated: String(b.allocated ?? "0"), spent: String(b.spent ?? "0"), variance: String((Number(b.budgetAmount) - Number(b.spent ?? "0"))), createdAt: new Date() }; this.budgetAllocations.set(id, budget); return budget; }

  async getTimeSeriesData(metric: string) { return this.timeSeriesDataMap.get(metric) || []; }
  async createTimeSeriesData(d: InsertTimeSeriesData) { const id = randomUUID(); const data: TimeSeriesData = { id, ...d, value: String(d.value), createdAt: new Date() }; const key = d.metric; if (!this.timeSeriesDataMap.has(key)) this.timeSeriesDataMap.set(key, []); this.timeSeriesDataMap.get(key)?.push(data); return data; }

  async getForecastModel(id: string) { return this.forecastModels.get(id); }
  async listForecastModels() { return Array.from(this.forecastModels.values()); }
  async createForecastModel(m: InsertForecastModel) { const id = randomUUID(); const model: ForecastModel = { id, ...m, accuracy: String(m.accuracy ?? "0"), mape: String(m.mape ?? "0"), createdAt: new Date() }; this.forecastModels.set(id, model); return model; }

  async getScenario(id: string) { return this.scenarios.get(id); }
  async listScenarios() { return Array.from(this.scenarios.values()); }
  async createScenario(s: InsertScenario) { const id = randomUUID(); const scenario: Scenario = { id, ...s, createdAt: new Date() }; this.scenarios.set(id, scenario); return scenario; }

  async getScenarioVariables(scenarioId: string) { return Array.from(this.scenarioVariables.values()).filter(v => v.scenarioId === scenarioId); }
  async addScenarioVariable(v: InsertScenarioVariable) { const id = randomUUID(); const variable: ScenarioVariable = { id, ...v, baselineValue: String(v.baselineValue), modifiedValue: String(v.modifiedValue) }; this.scenarioVariables.set(id, variable); return variable; }

  async getDashboardWidget(id: string) { return this.dashboardWidgets.get(id); }
  async listDashboardWidgets(dashboardId: string) { return Array.from(this.dashboardWidgets.values()).filter(w => w.dashboardId === dashboardId); }
  async createDashboardWidget(w: InsertDashboardWidget) { const id = randomUUID(); const widget: DashboardWidget = { id, ...w, createdAt: new Date() }; this.dashboardWidgets.set(id, widget); return widget; }

  async getReport(id: string) { return this.reports.get(id); }
  async listReports() { return Array.from(this.reports.values()); }
  async createReport(r: InsertReport) { const id = randomUUID(); const report: Report = { id, ...r, createdAt: new Date() }; this.reports.set(id, report); return report; }

  async getAuditLog(id: string) { return this.auditLogs.get(id); }
  async listAuditLogs(userId?: string) { const logs = Array.from(this.auditLogs.values()); return userId ? logs.filter(l => l.userId === userId) : logs; }
  async createAuditLog(l: InsertAuditLog) { const id = randomUUID(); const log: AuditLog = { id, ...l, timestamp: new Date() }; this.auditLogs.set(id, log); return log; }

  private apps = new Map<string, App>();
  private appReviews = new Map<string, AppReview>();
  private appInstallations = new Map<string, AppInstallation>();
  private connectors = new Map<string, Connector>();
  private connectorInstances = new Map<string, ConnectorInstance>();
  private webhookEvents = new Map<string, WebhookEvent>();

  async getApp(id: string) { return this.apps.get(id); }
  async listApps(category?: string) { const list = Array.from(this.apps.values()); return category ? list.filter(a => a.category === category) : list; }
  async createApp(a: InsertApp) { const id = randomUUID(); const app: App = { id, ...a, rating: a.rating ? String(a.rating) : "0", installCount: a.installCount ?? 0, createdAt: new Date() }; this.apps.set(id, app); return app; }

  async getAppReview(id: string) { return this.appReviews.get(id); }
  async listAppReviews(appId: string) { return Array.from(this.appReviews.values()).filter(r => r.appId === appId); }
  async createAppReview(r: InsertAppReview) { const id = randomUUID(); const review: AppReview = { id, ...r, createdAt: new Date() }; this.appReviews.set(id, review); return review; }

  async getAppInstallation(id: string) { return this.appInstallations.get(id); }
  async listAppInstallations(tenantId: string) { return Array.from(this.appInstallations.values()).filter(i => i.tenantId === tenantId); }
  async createAppInstallation(i: InsertAppInstallation) { const id = randomUUID(); const inst: AppInstallation = { id, ...i }; this.appInstallations.set(id, inst); return inst; }

  async getConnector(id: string) { return this.connectors.get(id); }
  async listConnectors(type?: string) { const list = Array.from(this.connectors.values()); return type ? list.filter(c => c.connectorType === type) : list; }
  async createConnector(c: InsertConnector) { const id = randomUUID(); const conn: Connector = { id, ...c, createdAt: new Date() }; this.connectors.set(id, conn); return conn; }

  async getConnectorInstance(id: string) { return this.connectorInstances.get(id); }
  async listConnectorInstances(tenantId: string) { return Array.from(this.connectorInstances.values()).filter(ci => ci.tenantId === tenantId); }
  async createConnectorInstance(ci: InsertConnectorInstance) { const id = randomUUID(); const inst: ConnectorInstance = { id, ...ci, createdAt: new Date() }; this.connectorInstances.set(id, inst); return inst; }

  async getWebhookEvent(id: string) { return this.webhookEvents.get(id); }
  async listWebhookEvents(appId: string) { return Array.from(this.webhookEvents.values()).filter(w => w.appId === appId); }
  async createWebhookEvent(w: InsertWebhookEvent) { const id = randomUUID(); const event: WebhookEvent = { id, ...w, createdAt: new Date() }; this.webhookEvents.set(id, event); return event; }

  private abacRules = new Map<string, AbacRule>();
  private encryptedFields = new Map<string, EncryptedField>();
  private complianceConfigs = new Map<string, ComplianceConfig>();
  private sprints = new Map<string, Sprint>();
  private issues = new Map<string, Issue>();

  async getAbacRule(id: string) { return this.abacRules.get(id); }
  async listAbacRules(resource?: string) { const list = Array.from(this.abacRules.values()); return resource ? list.filter(r => r.resource === resource) : list; }
  async createAbacRule(r: InsertAbacRule) { const id = randomUUID(); const rule: AbacRule = { id, ...r, createdAt: new Date() }; this.abacRules.set(id, rule); return rule; }

  async getEncryptedField(id: string) { return this.encryptedFields.get(id); }
  async listEncryptedFields(entityType?: string) { const list = Array.from(this.encryptedFields.values()); return entityType ? list.filter(f => f.entityType === entityType) : list; }
  async createEncryptedField(f: InsertEncryptedField) { const id = randomUUID(); const field: EncryptedField = { id, ...f, createdAt: new Date() }; this.encryptedFields.set(id, field); return field; }

  async getComplianceConfig(id: string) { return this.complianceConfigs.get(id); }
  async listComplianceConfigs(tenantId?: string) { const list = Array.from(this.complianceConfigs.values()); return tenantId ? list.filter(c => c.tenantId === tenantId) : list; }
  async createComplianceConfig(c: InsertComplianceConfig) { const id = randomUUID(); const cfg: ComplianceConfig = { id, ...c, createdAt: new Date() }; this.complianceConfigs.set(id, cfg); return cfg; }

  async getSprint(id: string) { return this.sprints.get(id); }
  async listSprints(projectId?: string) { const list = Array.from(this.sprints.values()); return projectId ? list.filter(s => s.projectId === projectId) : list; }
  async createSprint(s: InsertSprint) { const id = randomUUID(); const sprint: Sprint = { id, ...s, createdAt: new Date() }; this.sprints.set(id, sprint); return sprint; }

  async getIssue(id: string) { return this.issues.get(id); }
  async listIssues(sprintId?: string) { const list = Array.from(this.issues.values()); return sprintId ? list.filter(i => i.sprintId === sprintId) : list; }
  async createIssue(i: InsertIssue) { const id = randomUUID(); const issue: Issue = { id, ...i, createdAt: new Date() }; this.issues.set(id, issue); return issue; }

  private dataLakes = new Map<string, DataLake>();
  private etlPipelines = new Map<string, EtlPipeline>();
  private biDashboards = new Map<string, BiDashboard>();
  private fieldServiceJobs = new Map<string, FieldServiceJob>();
  private payrollConfigs = new Map<string, PayrollConfig>();

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
}

export const storage = new MemStorage();
