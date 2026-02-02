
import { db } from "@db";
import { wmsDockAppointments } from "@shared/schema/scm";
import { eq, and, gte, lte } from "drizzle-orm";

export class WmsYardService {

    async listAppointments(warehouseId: string, date: Date) {
        // Filter by Date Range (start of day to end of day)
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return await db.select()
            .from(wmsDockAppointments)
            .where(and(
                eq(wmsDockAppointments.warehouseId, warehouseId),
                gte(wmsDockAppointments.appointmentTime, startOfDay),
                lte(wmsDockAppointments.appointmentTime, endOfDay)
            ));
    }

    async createAppointment(data: typeof wmsDockAppointments.$inferInsert) {
        // Simple check for overlap could go here, for V1 we just insert.
        const [appt] = await db.insert(wmsDockAppointments).values(data).returning();
        return appt;
    }

    async updateStatus(id: string, status: string) {
        const [appt] = await db.update(wmsDockAppointments)
            .set({ status })
            .where(eq(wmsDockAppointments.id, id))
            .returning();
        return appt;
    }
}

export const wmsYardService = new WmsYardService();
