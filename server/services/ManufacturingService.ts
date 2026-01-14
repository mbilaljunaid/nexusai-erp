// Manufacturing Service Layer
import { db } from "../db";
import { eq, and, sql, desc } from "drizzle-orm";
import {
    bom, bomItems, workCenters, resources, routings, routingOperations,
    productionOrders, productionTransactions, qualityInspections,
    productionCalendars, shifts, standardOperations,
    type InsertBom, type InsertBomItem, type InsertWorkCenter,
    type InsertResource, type InsertRouting, type InsertRoutingOperation,
    type InsertProductionOrder, type InsertProductionTransaction,
    type InsertQualityInspection, type InsertProductionCalendar,
    type InsertShift, type InsertStandardOperation
} from "@shared/schema";

export class ManufacturingService {
    // ========== ENGINEERING (L8/L9) ==========

    async getWorkCenters() {
        return await db.select().from(workCenters).orderBy(workCenters.name);
    }

    async createWorkCenter(data: InsertWorkCenter) {
        const [result] = await db.insert(workCenters).values(data).returning();
        return result;
    }

    async getResources() {
        return await db.select().from(resources).orderBy(resources.resourceCode);
    }

    async createResource(data: InsertResource) {
        const [result] = await db.insert(resources).values(data).returning();
        return result;
    }

    async getCalendars() {
        return await db.select().from(productionCalendars).orderBy(productionCalendars.calendarCode);
    }

    async createCalendar(data: InsertProductionCalendar) {
        const [result] = await db.insert(productionCalendars).values(data).returning();
        return result;
    }

    async getShifts(calendarId: string) {
        return await db.select().from(shifts).where(eq(shifts.calendarId, calendarId)).orderBy(shifts.startTime);
    }

    async createShift(data: InsertShift) {
        const [result] = await db.insert(shifts).values(data).returning();
        return result;
    }

    async getStandardOperations() {
        return await db.select().from(standardOperations).orderBy(standardOperations.code);
    }

    async createStandardOperation(data: InsertStandardOperation) {
        const [result] = await db.insert(standardOperations).values(data).returning();
        return result;
    }

    async listBoms(limit = 50, offset = 0) {
        const items = await db.select().from(bom).orderBy(desc(bom.createdAt)).limit(limit).offset(offset);
        const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(bom);
        return { items, total: Number(countResult.count) };
    }

    async getBom(id: string) {
        const [header] = await db.select().from(bom).where(eq(bom.id, id)).limit(1);
        if (!header) return undefined;
        const items = await db.select().from(bomItems).where(eq(bomItems.bomId, id));
        return { ...header, items };
    }

    async createBom(data: { header: InsertBom, items: InsertBomItem[] }) {
        return await db.transaction(async (tx) => {
            const [header] = await tx.insert(bom).values(data.header).returning();
            if (data.items.length > 0) {
                const itemsWithId = data.items.map(item => ({ ...item, bomId: header.id }));
                await tx.insert(bomItems).values(itemsWithId);
            }
            return { ...header, items: data.items };
        });
    }

    async getRoutings() {
        return await db.select().from(routings).orderBy(desc(routings.createdAt));
    }

    async getRouting(id: string) {
        const [header] = await db.select().from(routings).where(eq(routings.id, id)).limit(1);
        if (!header) return undefined;
        const operations = await db.select().from(routingOperations)
            .where(eq(routingOperations.routingId, id))
            .orderBy(routingOperations.operationSeq);
        return { ...header, operations };
    }

    async createRouting(data: { header: InsertRouting, operations: InsertRoutingOperation[] }) {
        return await db.transaction(async (tx) => {
            const [header] = await tx.insert(routings).values(data.header).returning();
            if (data.operations.length > 0) {
                const opsWithId = data.operations.map(op => ({ ...op, routingId: header.id }));
                await tx.insert(routingOperations).values(opsWithId);
            }
            return { ...header, operations: data.operations };
        });
    }

    // ========== EXECUTION (L3/L6/L10) ==========

    async listWorkOrders(limit = 50, offset = 0, filters?: { startDate?: string; endDate?: string }) {
        const { inventory } = await import("@shared/schema");

        let whereClause = undefined;
        if (filters?.startDate && filters?.endDate) {
            whereClause = and(
                sql`${productionOrders.scheduledDate} >= ${filters.startDate}::date`,
                sql`${productionOrders.scheduledDate} <= ${filters.endDate}::date`
            );
        }

        const items = await db.select({
            id: productionOrders.id,
            orderNumber: productionOrders.orderNumber,
            productId: productionOrders.productId,
            productName: sql`(${db.select({ name: inventory.itemName }).from(inventory).where(eq(inventory.id, productionOrders.productId)).limit(1)})`,
            quantity: productionOrders.quantity,
            status: productionOrders.status,
            scheduledDate: productionOrders.scheduledDate,
            priority: productionOrders.priority,
            workCenterId: productionOrders.workCenterId,
            createdAt: productionOrders.createdAt
        }).from(productionOrders)
            .where(whereClause)
            .orderBy(desc(productionOrders.createdAt))
            .limit(limit)
            .offset(offset);

        const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(productionOrders);
        return { items, total: Number(countResult.count) };
    }

    async createWorkOrder(data: InsertProductionOrder) {
        const [wo] = await db.insert(productionOrders).values(data).returning();
        return wo;
    }

    async updateWorkOrderStatus(id: string, status: string) {
        const [updated] = await db.update(productionOrders)
            .set({ status })
            .where(eq(productionOrders.id, id))
            .returning();
        return updated;
    }

    async recordTransaction(data: InsertProductionTransaction) {
        return await db.transaction(async (tx) => {
            const [trx] = await tx.insert(productionTransactions).values(data).returning();

            // If completion, update WO status
            if (data.transactionType === "COMPLETE") {
                await tx.update(productionOrders)
                    .set({ status: "completed" })
                    .where(eq(productionOrders.id, data.productionOrderId));
            }

            return trx;
        });
    }

    // ========== QUALITY (L10/L14) ==========

    async listInspections(limit = 50, offset = 0) {
        const items = await db.select({
            id: qualityInspections.id,
            productionOrderId: qualityInspections.productionOrderId,
            orderNumber: sql`(${db.select({ number: productionOrders.orderNumber }).from(productionOrders).where(eq(productionOrders.id, qualityInspections.productionOrderId)).limit(1)})`,
            inspectorId: qualityInspections.inspectorId,
            inspectionDate: qualityInspections.inspectionDate,
            status: qualityInspections.status,
            findings: qualityInspections.findings,
            createdAt: qualityInspections.createdAt
        }).from(qualityInspections)
            .orderBy(desc(qualityInspections.createdAt))
            .limit(limit)
            .offset(offset);

        const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(qualityInspections);
        return { items, total: Number(countResult.count) };
    }

    async createInspection(data: InsertQualityInspection) {
        const [result] = await db.insert(qualityInspections).values(data).returning();
        return result;
    }

    async updateInspectionStatus(id: string, status: string, findings?: string) {
        const [updated] = await db.update(qualityInspections)
            .set({ status, findings, inspectionDate: new Date() })
            .where(eq(qualityInspections.id, id))
            .returning();
        return updated;
    }
}

export const manufacturingService = new ManufacturingService();
