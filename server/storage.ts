import { 
  type User, type InsertUser,
  type Bom, type InsertBom,
  type BomLine, type InsertBomLine,
  type WorkOrder, type InsertWorkOrder,
  type ProductionOrder, type InsertProductionOrder,
  type QualityCheck, type InsertQualityCheck,
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private boms: Map<string, Bom>;
  private bomLines: Map<string, BomLine>;
  private workOrders: Map<string, WorkOrder>;
  private productionOrders: Map<string, ProductionOrder>;
  private qualityChecks: Map<string, QualityCheck>;

  constructor() {
    this.users = new Map();
    this.boms = new Map();
    this.bomLines = new Map();
    this.workOrders = new Map();
    this.productionOrders = new Map();
    this.qualityChecks = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // BOMs
  async getBom(id: string): Promise<Bom | undefined> {
    return this.boms.get(id);
  }

  async listBoms(): Promise<Bom[]> {
    return Array.from(this.boms.values());
  }

  async createBom(insertBom: InsertBom): Promise<Bom> {
    const id = randomUUID();
    const bom: Bom = {
      ...insertBom,
      id,
      createdAt: new Date(),
    };
    this.boms.set(id, bom);
    return bom;
  }

  async updateBom(id: string, insertBom: Partial<InsertBom>): Promise<Bom | undefined> {
    const existing = this.boms.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...insertBom };
    this.boms.set(id, updated);
    return updated;
  }

  async deleteBom(id: string): Promise<boolean> {
    return this.boms.delete(id);
  }

  // BOM Lines
  async getBomLines(bomId: string): Promise<BomLine[]> {
    return Array.from(this.bomLines.values()).filter(
      (line) => line.bomId === bomId,
    );
  }

  async addBomLine(insertLine: InsertBomLine): Promise<BomLine> {
    const id = randomUUID();
    const line: BomLine = { ...insertLine, id };
    this.bomLines.set(id, line);
    return line;
  }

  async updateBomLine(id: string, insertLine: Partial<InsertBomLine>): Promise<BomLine | undefined> {
    const existing = this.bomLines.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...insertLine };
    this.bomLines.set(id, updated);
    return updated;
  }

  async deleteBomLine(id: string): Promise<boolean> {
    return this.bomLines.delete(id);
  }

  // Work Orders
  async getWorkOrder(id: string): Promise<WorkOrder | undefined> {
    return this.workOrders.get(id);
  }

  async listWorkOrders(): Promise<WorkOrder[]> {
    return Array.from(this.workOrders.values());
  }

  async createWorkOrder(insertWo: InsertWorkOrder): Promise<WorkOrder> {
    const id = randomUUID();
    const woNumber = `WO-${Date.now()}`;
    const wo: WorkOrder = {
      ...insertWo,
      id,
      woNumber,
      createdAt: new Date(),
    };
    this.workOrders.set(id, wo);
    return wo;
  }

  async updateWorkOrder(id: string, insertWo: Partial<InsertWorkOrder>): Promise<WorkOrder | undefined> {
    const existing = this.workOrders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...insertWo };
    this.workOrders.set(id, updated);
    return updated;
  }

  async deleteWorkOrder(id: string): Promise<boolean> {
    return this.workOrders.delete(id);
  }

  // Production Orders
  async getProductionOrder(id: string): Promise<ProductionOrder | undefined> {
    return this.productionOrders.get(id);
  }

  async listProductionOrders(): Promise<ProductionOrder[]> {
    return Array.from(this.productionOrders.values());
  }

  async createProductionOrder(insertPo: InsertProductionOrder): Promise<ProductionOrder> {
    const id = randomUUID();
    const poNumber = `PO-${Date.now()}`;
    const po: ProductionOrder = {
      ...insertPo,
      id,
      poNumber,
      createdAt: new Date(),
    };
    this.productionOrders.set(id, po);
    return po;
  }

  async updateProductionOrder(id: string, insertPo: Partial<InsertProductionOrder>): Promise<ProductionOrder | undefined> {
    const existing = this.productionOrders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...insertPo };
    this.productionOrders.set(id, updated);
    return updated;
  }

  async deleteProductionOrder(id: string): Promise<boolean> {
    return this.productionOrders.delete(id);
  }

  // Quality Checks
  async getQualityCheck(id: string): Promise<QualityCheck | undefined> {
    return this.qualityChecks.get(id);
  }

  async listQualityChecks(workOrderId?: string): Promise<QualityCheck[]> {
    const checks = Array.from(this.qualityChecks.values());
    if (workOrderId) {
      return checks.filter((qc) => qc.workOrderId === workOrderId);
    }
    return checks;
  }

  async createQualityCheck(insertQc: InsertQualityCheck): Promise<QualityCheck> {
    const id = randomUUID();
    const qc: QualityCheck = {
      ...insertQc,
      id,
      checkDate: new Date(),
    };
    this.qualityChecks.set(id, qc);
    return qc;
  }

  async updateQualityCheck(id: string, insertQc: Partial<InsertQualityCheck>): Promise<QualityCheck | undefined> {
    const existing = this.qualityChecks.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...insertQc };
    this.qualityChecks.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
