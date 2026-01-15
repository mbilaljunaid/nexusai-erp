
import { db } from "../../db";
import { omTransactionTypes, omHoldDefinitions } from "../../../shared/schema/order_management";
import { eq } from "drizzle-orm";

export class OrderConfigService {

    // --- Order Types ---

    async createOrderType(data: any) {
        const [type] = await db.insert(omTransactionTypes).values(data).returning();
        return type;
    }

    async getOrderTypes() {
        return await db.query.omTransactionTypes.findMany();
    }

    async toggleOrderType(id: string, isActive: boolean) {
        const [type] = await db.update(omTransactionTypes)
            .set({ isActive })
            .where(eq(omTransactionTypes.id, id))
            .returning();
        return type;
    }

    // --- Hold Definitions ---

    async createHoldDefinition(data: any) {
        const [hold] = await db.insert(omHoldDefinitions).values(data).returning();
        return hold;
    }

    async getHoldDefinitions() {
        return await db.query.omHoldDefinitions.findMany();
    }
}

export const orderConfigService = new OrderConfigService();
