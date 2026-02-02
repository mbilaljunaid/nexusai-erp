
import { db } from "../db";
import { purchaseRequisitions, purchaseRequisitionLines } from "../../shared/schema/scm";
import { eq, sql } from "drizzle-orm";

export class SCMService {
    async createRequisition(data: any) {
        const [req] = await db.insert(purchaseRequisitions).values({
            ...data,
            requisitionNumber: data.requisitionNumber || `REQ-${Date.now()}`
        }).returning();
        return req;
    }

    async addRequisitionLine(requisitionId: string, data: any) {
        const lines = await db.select().from(purchaseRequisitionLines).where(eq(purchaseRequisitionLines.requisitionId, requisitionId));
        const lineNum = lines.length + 1;

        const [line] = await db.insert(purchaseRequisitionLines).values({
            ...data,
            requisitionId,
            lineNumber: lineNum
        }).returning();

        return line;
    }

    async getRequisition(id: string) {
        const [req] = await db.select().from(purchaseRequisitions).where(eq(purchaseRequisitions.id, id));
        if (!req) return null;

        const lines = await db.select().from(purchaseRequisitionLines).where(eq(purchaseRequisitionLines.requisitionId, id));
        return { ...req, lines };
    }
}

export const scmService = new SCMService();
