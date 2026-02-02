
import { db } from "../../db";
import { wmsHandlingUnitTypes } from "../../../shared/schema/scm";
import { eq, and } from "drizzle-orm";

export class WmsUnitTypeService {
    async list(warehouseId: string) {
        return await db.select().from(wmsHandlingUnitTypes).where(eq(wmsHandlingUnitTypes.warehouseId, warehouseId));
    }

    async create(data: {
        warehouseId: string;
        code: string;
        description: string;
        length?: number;
        width?: number;
        height?: number;
        maxWeight?: number;
    }) {
        const [unitType] = await db.insert(wmsHandlingUnitTypes).values({
            warehouseId: data.warehouseId,
            code: data.code,
            description: data.description,
            length: data.length?.toString(),
            width: data.width?.toString(),
            height: data.height?.toString(),
            maxWeight: data.maxWeight?.toString(),
        }).returning();
        return unitType;
    }

    async delete(id: string) {
        await db.delete(wmsHandlingUnitTypes).where(eq(wmsHandlingUnitTypes.id, id));
    }
}

export const wmsUnitTypeService = new WmsUnitTypeService();
