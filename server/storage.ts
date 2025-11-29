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
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // BOMs
  getBom(id: string): Promise<Bom | undefined>;
  listBoms(): Promise<Bom[]>;
  createBom(bom: InsertBom): Promise<Bom>;
  updateBom(id: string, bom: Partial<InsertBom>): Promise<Bom | undefined>;
  deleteBom(id: string): Promise<boolean>;

  // BOM Lines
  getBomLines(bomId: string): Promise<BomLine[]>;
  addBomLine(line: InsertBomLine): Promise<BomLine>;
  updateBomLine(id: string, line: Partial<InsertBomLine>): Promise<BomLine | undefined>;
  deleteBomLine(id: string): Promise<boolean>;

  // Work Orders
  getWorkOrder(id: string): Promise<WorkOrder | undefined>;
  listWorkOrders(): Promise<WorkOrder[]>;
  createWorkOrder(wo: InsertWorkOrder): Promise<WorkOrder>;
  updateWorkOrder(id: string, wo: Partial<InsertWorkOrder>): Promise<WorkOrder | undefined>;
  deleteWorkOrder(id: string): Promise<boolean>;

  // Production Orders
  getProductionOrder(id: string): Promise<ProductionOrder | undefined>;
  listProductionOrders(): Promise<ProductionOrder[]>;
  createProductionOrder(po: InsertProductionOrder): Promise<ProductionOrder>;
  updateProductionOrder(id: string, po: Partial<InsertProductionOrder>): Promise<ProductionOrder | undefined>;
  deleteProductionOrder(id: string): Promise<boolean>;

  // Quality Checks
  getQualityCheck(id: string): Promise<QualityCheck | undefined>;
  listQualityChecks(workOrderId?: string): Promise<QualityCheck[]>;
  createQualityCheck(qc: InsertQualityCheck): Promise<QualityCheck>;
  updateQualityCheck(id: string, qc: Partial<InsertQualityCheck>): Promise<QualityCheck | undefined>;

  // Routings
  getRouting(id: string): Promise<Routing | undefined>;
  listRoutings(): Promise<Routing[]>;
  createRouting(routing: InsertRouting): Promise<Routing>;
  updateRouting(id: string, routing: Partial<InsertRouting>): Promise<Routing | undefined>;

  // Routing Operations
  getRoutingOperations(routingId: string): Promise<RoutingOperation[]>;
  addRoutingOperation(op: InsertRoutingOperation): Promise<RoutingOperation>;
  updateRoutingOperation(id: string, op: Partial<InsertRoutingOperation>): Promise<RoutingOperation | undefined>;

  // Work Centers
  getWorkCenter(id: string): Promise<WorkCenter | undefined>;
  listWorkCenters(): Promise<WorkCenter[]>;
  createWorkCenter(wc: InsertWorkCenter): Promise<WorkCenter>;
  updateWorkCenter(id: string, wc: Partial<InsertWorkCenter>): Promise<WorkCenter | undefined>;

  // MRP Forecasts
  getMrpForecast(id: string): Promise<MrpForecast | undefined>;
  listMrpForecasts(): Promise<MrpForecast[]>;
  createMrpForecast(forecast: InsertMrpForecast): Promise<MrpForecast>;
  updateMrpForecast(id: string, forecast: Partial<InsertMrpForecast>): Promise<MrpForecast | undefined>;

  // Replenishment Rules
  getReplenishmentRule(id: string): Promise<ReplenishmentRule | undefined>;
  listReplenishmentRules(): Promise<ReplenishmentRule[]>;
  createReplenishmentRule(rule: InsertReplenishmentRule): Promise<ReplenishmentRule>;
  updateReplenishmentRule(id: string, rule: Partial<InsertReplenishmentRule>): Promise<ReplenishmentRule | undefined>;

  // Warehouses
  getWarehouse(id: string): Promise<Warehouse | undefined>;
  listWarehouses(): Promise<Warehouse[]>;
  createWarehouse(wh: InsertWarehouse): Promise<Warehouse>;
  updateWarehouse(id: string, wh: Partial<InsertWarehouse>): Promise<Warehouse | undefined>;

  // Stock Locations
  getStockLocation(id: string): Promise<StockLocation | undefined>;
  listStockLocations(warehouseId?: string): Promise<StockLocation[]>;
  createStockLocation(loc: InsertStockLocation): Promise<StockLocation>;
  updateStockLocation(id: string, loc: Partial<InsertStockLocation>): Promise<StockLocation | undefined>;

  // Stock Moves
  getStockMove(id: string): Promise<StockMove | undefined>;
  listStockMoves(): Promise<StockMove[]>;
  createStockMove(move: InsertStockMove): Promise<StockMove>;
  updateStockMove(id: string, move: Partial<InsertStockMove>): Promise<StockMove | undefined>;

  // Maintenance
  getMaintenance(id: string): Promise<Maintenance | undefined>;
  listMaintenance(workCenterId?: string): Promise<Maintenance[]>;
  createMaintenance(maint: InsertMaintenance): Promise<Maintenance>;
  updateMaintenance(id: string, maint: Partial<InsertMaintenance>): Promise<Maintenance | undefined>;

  // Production Costs
  getProductionCost(id: string): Promise<ProductionCost | undefined>;
  listProductionCosts(productionOrderId?: string): Promise<ProductionCost[]>;
  createProductionCost(cost: InsertProductionCost): Promise<ProductionCost>;
  updateProductionCost(id: string, cost: Partial<InsertProductionCost>): Promise<ProductionCost | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private boms: Map<string, Bom>;
  private bomLines: Map<string, BomLine>;
  private workOrders: Map<string, WorkOrder>;
  private productionOrders: Map<string, ProductionOrder>;
  private qualityChecks: Map<string, QualityCheck>;
  private routings: Map<string, Routing>;
  private routingOperations: Map<string, RoutingOperation>;
  private workCenters: Map<string, WorkCenter>;
  private mrpForecasts: Map<string, MrpForecast>;
  private replenishmentRules: Map<string, ReplenishmentRule>;
  private warehouses: Map<string, Warehouse>;
  private stockLocations: Map<string, StockLocation>;
  private stockMoves: Map<string, StockMove>;
  private maintenanceRecords: Map<string, Maintenance>;
  private productionCosts: Map<string, ProductionCost>;

  constructor() {
    this.users = new Map();
    this.boms = new Map();
    this.bomLines = new Map();
    this.workOrders = new Map();
    this.productionOrders = new Map();
    this.qualityChecks = new Map();
    this.routings = new Map();
    this.routingOperations = new Map();
    this.workCenters = new Map();
    this.mrpForecasts = new Map();
    this.replenishmentRules = new Map();
    this.warehouses = new Map();
    this.stockLocations = new Map();
    this.stockMoves = new Map();
    this.maintenanceRecords = new Map();
    this.productionCosts = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> { return this.users.get(id); }
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // BOMs
  async getBom(id: string): Promise<Bom | undefined> { return this.boms.get(id); }
  async listBoms(): Promise<Bom[]> { return Array.from(this.boms.values()); }
  async createBom(insertBom: InsertBom): Promise<Bom> {
    const id = randomUUID();
    const bom: Bom = { id, ...insertBom, quantity: String(insertBom.quantity), yield: insertBom.yield ?? "100", createdAt: new Date() };
    this.boms.set(id, bom);
    return bom;
  }
  async updateBom(id: string, insertBom: Partial<InsertBom>): Promise<Bom | undefined> {
    const existing = this.boms.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...insertBom, quantity: String(insertBom.quantity ?? existing.quantity) };
    this.boms.set(id, updated);
    return updated;
  }
  async deleteBom(id: string): Promise<boolean> { return this.boms.delete(id); }

  // BOM Lines
  async getBomLines(bomId: string): Promise<BomLine[]> {
    return Array.from(this.bomLines.values()).filter(l => l.bomId === bomId);
  }
  async addBomLine(insertLine: InsertBomLine): Promise<BomLine> {
    const id = randomUUID();
    const line: BomLine = { id, ...insertLine, quantity: String(insertLine.quantity), scrapPercentage: insertLine.scrapPercentage ?? "0" };
    this.bomLines.set(id, line);
    return line;
  }
  async updateBomLine(id: string, insertLine: Partial<InsertBomLine>): Promise<BomLine | undefined> {
    const existing = this.bomLines.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...insertLine, quantity: insertLine.quantity ? String(insertLine.quantity) : existing.quantity };
    this.bomLines.set(id, updated);
    return updated;
  }
  async deleteBomLine(id: string): Promise<boolean> { return this.bomLines.delete(id); }

  // Work Orders
  async getWorkOrder(id: string): Promise<WorkOrder | undefined> { return this.workOrders.get(id); }
  async listWorkOrders(): Promise<WorkOrder[]> { return Array.from(this.workOrders.values()); }
  async createWorkOrder(insertWo: InsertWorkOrder): Promise<WorkOrder> {
    const id = randomUUID();
    const wo: WorkOrder = { id, woNumber: `WO-${Date.now()}`, ...insertWo, quantity: String(insertWo.quantity), createdAt: new Date() };
    this.workOrders.set(id, wo);
    return wo;
  }
  async updateWorkOrder(id: string, insertWo: Partial<InsertWorkOrder>): Promise<WorkOrder | undefined> {
    const existing = this.workOrders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...insertWo, quantity: insertWo.quantity ? String(insertWo.quantity) : existing.quantity };
    this.workOrders.set(id, updated);
    return updated;
  }
  async deleteWorkOrder(id: string): Promise<boolean> { return this.workOrders.delete(id); }

  // Production Orders
  async getProductionOrder(id: string): Promise<ProductionOrder | undefined> { return this.productionOrders.get(id); }
  async listProductionOrders(): Promise<ProductionOrder[]> { return Array.from(this.productionOrders.values()); }
  async createProductionOrder(insertPo: InsertProductionOrder): Promise<ProductionOrder> {
    const id = randomUUID();
    const po: ProductionOrder = { id, poNumber: `PO-${Date.now()}`, ...insertPo, quantity: String(insertPo.quantity), createdAt: new Date() };
    this.productionOrders.set(id, po);
    return po;
  }
  async updateProductionOrder(id: string, insertPo: Partial<InsertProductionOrder>): Promise<ProductionOrder | undefined> {
    const existing = this.productionOrders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...insertPo, quantity: insertPo.quantity ? String(insertPo.quantity) : existing.quantity };
    this.productionOrders.set(id, updated);
    return updated;
  }
  async deleteProductionOrder(id: string): Promise<boolean> { return this.productionOrders.delete(id); }

  // Quality Checks
  async getQualityCheck(id: string): Promise<QualityCheck | undefined> { return this.qualityChecks.get(id); }
  async listQualityChecks(workOrderId?: string): Promise<QualityCheck[]> {
    const checks = Array.from(this.qualityChecks.values());
    return workOrderId ? checks.filter(q => q.workOrderId === workOrderId) : checks;
  }
  async createQualityCheck(insertQc: InsertQualityCheck): Promise<QualityCheck> {
    const id = randomUUID();
    const qc: QualityCheck = { id, ...insertQc, quantity: String(insertQc.quantity), quantityPassed: String(insertQc.quantityPassed), quantityFailed: insertQc.quantityFailed ?? "0", checkDate: new Date() };
    this.qualityChecks.set(id, qc);
    return qc;
  }
  async updateQualityCheck(id: string, insertQc: Partial<InsertQualityCheck>): Promise<QualityCheck | undefined> {
    const existing = this.qualityChecks.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...insertQc, quantity: insertQc.quantity ? String(insertQc.quantity) : existing.quantity, quantityPassed: insertQc.quantityPassed ? String(insertQc.quantityPassed) : existing.quantityPassed };
    this.qualityChecks.set(id, updated);
    return updated;
  }

  // Routings
  async getRouting(id: string): Promise<Routing | undefined> { return this.routings.get(id); }
  async listRoutings(): Promise<Routing[]> { return Array.from(this.routings.values()); }
  async createRouting(insertRouting: InsertRouting): Promise<Routing> {
    const id = randomUUID();
    const routing: Routing = { id, ...insertRouting, createdAt: new Date() };
    this.routings.set(id, routing);
    return routing;
  }
  async updateRouting(id: string, insertRouting: Partial<InsertRouting>): Promise<Routing | undefined> {
    const existing = this.routings.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...insertRouting };
    this.routings.set(id, updated);
    return updated;
  }

  // Routing Operations
  async getRoutingOperations(routingId: string): Promise<RoutingOperation[]> {
    return Array.from(this.routingOperations.values()).filter(op => op.routingId === routingId);
  }
  async addRoutingOperation(insertOp: InsertRoutingOperation): Promise<RoutingOperation> {
    const id = randomUUID();
    const op: RoutingOperation = { id, ...insertOp, cycleTime: String(insertOp.cycleTime), setupTime: insertOp.setupTime ?? "0" };
    this.routingOperations.set(id, op);
    return op;
  }
  async updateRoutingOperation(id: string, insertOp: Partial<InsertRoutingOperation>): Promise<RoutingOperation | undefined> {
    const existing = this.routingOperations.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...insertOp, cycleTime: insertOp.cycleTime ? String(insertOp.cycleTime) : existing.cycleTime };
    this.routingOperations.set(id, updated);
    return updated;
  }

  // Work Centers
  async getWorkCenter(id: string): Promise<WorkCenter | undefined> { return this.workCenters.get(id); }
  async listWorkCenters(): Promise<WorkCenter[]> { return Array.from(this.workCenters.values()); }
  async createWorkCenter(insertWc: InsertWorkCenter): Promise<WorkCenter> {
    const id = randomUUID();
    const wc: WorkCenter = { id, ...insertWc, capacity: String(insertWc.capacity), costPerHour: String(insertWc.costPerHour) };
    this.workCenters.set(id, wc);
    return wc;
  }
  async updateWorkCenter(id: string, insertWc: Partial<InsertWorkCenter>): Promise<WorkCenter | undefined> {
    const existing = this.workCenters.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...insertWc, capacity: insertWc.capacity ? String(insertWc.capacity) : existing.capacity };
    this.workCenters.set(id, updated);
    return updated;
  }

  // MRP Forecasts
  async getMrpForecast(id: string): Promise<MrpForecast | undefined> { return this.mrpForecasts.get(id); }
  async listMrpForecasts(): Promise<MrpForecast[]> { return Array.from(this.mrpForecasts.values()); }
  async createMrpForecast(insertForecast: InsertMrpForecast): Promise<MrpForecast> {
    const id = randomUUID();
    const forecast: MrpForecast = { id, ...insertForecast, quantity: String(insertForecast.quantity), createdAt: new Date() };
    this.mrpForecasts.set(id, forecast);
    return forecast;
  }
  async updateMrpForecast(id: string, insertForecast: Partial<InsertMrpForecast>): Promise<MrpForecast | undefined> {
    const existing = this.mrpForecasts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...insertForecast, quantity: insertForecast.quantity ? String(insertForecast.quantity) : existing.quantity };
    this.mrpForecasts.set(id, updated);
    return updated;
  }

  // Replenishment Rules
  async getReplenishmentRule(id: string): Promise<ReplenishmentRule | undefined> { return this.replenishmentRules.get(id); }
  async listReplenishmentRules(): Promise<ReplenishmentRule[]> { return Array.from(this.replenishmentRules.values()); }
  async createReplenishmentRule(insertRule: InsertReplenishmentRule): Promise<ReplenishmentRule> {
    const id = randomUUID();
    const rule: ReplenishmentRule = { id, ...insertRule, minStock: String(insertRule.minStock), maxStock: String(insertRule.maxStock), reorderQuantity: String(insertRule.reorderQuantity) };
    this.replenishmentRules.set(id, rule);
    return rule;
  }
  async updateReplenishmentRule(id: string, insertRule: Partial<InsertReplenishmentRule>): Promise<ReplenishmentRule | undefined> {
    const existing = this.replenishmentRules.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...insertRule, minStock: insertRule.minStock ? String(insertRule.minStock) : existing.minStock };
    this.replenishmentRules.set(id, updated);
    return updated;
  }

  // Warehouses
  async getWarehouse(id: string): Promise<Warehouse | undefined> { return this.warehouses.get(id); }
  async listWarehouses(): Promise<Warehouse[]> { return Array.from(this.warehouses.values()); }
  async createWarehouse(insertWh: InsertWarehouse): Promise<Warehouse> {
    const id = randomUUID();
    const wh: Warehouse = { id, ...insertWh };
    this.warehouses.set(id, wh);
    return wh;
  }
  async updateWarehouse(id: string, insertWh: Partial<InsertWarehouse>): Promise<Warehouse | undefined> {
    const existing = this.warehouses.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...insertWh };
    this.warehouses.set(id, updated);
    return updated;
  }

  // Stock Locations
  async getStockLocation(id: string): Promise<StockLocation | undefined> { return this.stockLocations.get(id); }
  async listStockLocations(warehouseId?: string): Promise<StockLocation[]> {
    const locs = Array.from(this.stockLocations.values());
    return warehouseId ? locs.filter(l => l.warehouseId === warehouseId) : locs;
  }
  async createStockLocation(insertLoc: InsertStockLocation): Promise<StockLocation> {
    const id = randomUUID();
    const loc: StockLocation = { id, ...insertLoc };
    this.stockLocations.set(id, loc);
    return loc;
  }
  async updateStockLocation(id: string, insertLoc: Partial<InsertStockLocation>): Promise<StockLocation | undefined> {
    const existing = this.stockLocations.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...insertLoc };
    this.stockLocations.set(id, updated);
    return updated;
  }

  // Stock Moves
  async getStockMove(id: string): Promise<StockMove | undefined> { return this.stockMoves.get(id); }
  async listStockMoves(): Promise<StockMove[]> { return Array.from(this.stockMoves.values()); }
  async createStockMove(insertMove: InsertStockMove): Promise<StockMove> {
    const id = randomUUID();
    const move: StockMove = { id, moveNumber: `SM-${Date.now()}`, ...insertMove, quantity: String(insertMove.quantity), moveDate: new Date() };
    this.stockMoves.set(id, move);
    return move;
  }
  async updateStockMove(id: string, insertMove: Partial<InsertStockMove>): Promise<StockMove | undefined> {
    const existing = this.stockMoves.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...insertMove, quantity: insertMove.quantity ? String(insertMove.quantity) : existing.quantity };
    this.stockMoves.set(id, updated);
    return updated;
  }

  // Maintenance
  async getMaintenance(id: string): Promise<Maintenance | undefined> { return this.maintenanceRecords.get(id); }
  async listMaintenance(workCenterId?: string): Promise<Maintenance[]> {
    const records = Array.from(this.maintenanceRecords.values());
    return workCenterId ? records.filter(r => r.workCenterId === workCenterId) : records;
  }
  async createMaintenance(insertMaint: InsertMaintenance): Promise<Maintenance> {
    const id = randomUUID();
    const maint: Maintenance = { id, maintenanceNumber: `MNT-${Date.now()}`, ...insertMaint, createdAt: new Date() };
    this.maintenanceRecords.set(id, maint);
    return maint;
  }
  async updateMaintenance(id: string, insertMaint: Partial<InsertMaintenance>): Promise<Maintenance | undefined> {
    const existing = this.maintenanceRecords.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...insertMaint };
    this.maintenanceRecords.set(id, updated);
    return updated;
  }

  // Production Costs
  async getProductionCost(id: string): Promise<ProductionCost | undefined> { return this.productionCosts.get(id); }
  async listProductionCosts(productionOrderId?: string): Promise<ProductionCost[]> {
    const costs = Array.from(this.productionCosts.values());
    return productionOrderId ? costs.filter(c => c.productionOrderId === productionOrderId) : costs;
  }
  async createProductionCost(insertCost: InsertProductionCost): Promise<ProductionCost> {
    const id = randomUUID();
    const cost: ProductionCost = { id, ...insertCost, amount: String(insertCost.amount), recordedDate: new Date() };
    this.productionCosts.set(id, cost);
    return cost;
  }
  async updateProductionCost(id: string, insertCost: Partial<InsertProductionCost>): Promise<ProductionCost | undefined> {
    const existing = this.productionCosts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...insertCost, amount: insertCost.amount ? String(insertCost.amount) : existing.amount };
    this.productionCosts.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
