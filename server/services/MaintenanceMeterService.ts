
import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import { maintMeters, maintMeterReadings } from "@shared/schema";

export class MaintenanceMeterService {

    /**
     * Define a new meter for an asset
     */
    async createMeter(data: typeof maintMeters.$inferInsert) {
        const [meter] = await db.insert(maintMeters).values(data).returning();
        return meter;
    }

    async getMetersForAsset(assetId: string) {
        return await db.select().from(maintMeters).where(eq(maintMeters.assetId, assetId));
    }

    /**
     * Log a reading. Updates the meter's current value.
     * Calculates delta automatically if ABSOLUTE.
     */
    async logReading(meterId: string, value: string | number, source: string = "MANUAL", workOrderId?: string) {
        const numValue = Number(value);

        // 1. Get Meter to check type and previous value
        const meter = await db.query.maintMeters.findFirst({
            where: eq(maintMeters.id, meterId)
        });

        if (!meter) throw new Error("Meter not found");

        let deltaValue = 0;

        if (meter.readingType === "ABSOLUTE") {
            const current = Number(meter.currentValue || 0);
            if (numValue < current) {
                // Potential rollover or error
                console.warn(`[METER] New reading ${numValue} is less than current ${current}. Assuming rollover or correction.`);
                deltaValue = numValue; // Or handle rollover logic
            } else {
                deltaValue = numValue - current;
            }
        } else {
            // Delta type (e.g. "Run 5 hours")
            deltaValue = numValue;
        }

        // 2. Insert Reading Log
        const [reading] = await db.insert(maintMeterReadings).values({
            meterId,
            readingValue: numValue.toString(),
            deltaValue: deltaValue.toString(),
            readingDate: new Date(),
            source,
            workOrderId
        }).returning();

        // 3. Update Meter Current Value
        // If ABSOLUTE: Set to new value
        // If DELTA: Add to current value
        let newCurrent = 0;
        if (meter.readingType === "ABSOLUTE") {
            newCurrent = numValue;
        } else {
            newCurrent = Number(meter.currentValue || 0) + numValue;
        }

        await db.update(maintMeters)
            .set({
                currentValue: newCurrent.toString(),
                lastReadingDate: new Date()
            })
            .where(eq(maintMeters.id, meterId));

        return reading;
    }

    async getReadingHistory(meterId: string) {
        return await db.select().from(maintMeterReadings)
            .where(eq(maintMeterReadings.meterId, meterId))
            .orderBy(desc(maintMeterReadings.readingDate));
    }
}

export const maintenanceMeterService = new MaintenanceMeterService();
