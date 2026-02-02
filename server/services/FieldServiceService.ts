
import { db } from "../db";
import { serviceWorkOrders, serviceAppointments, cases, accounts, contacts } from "../../shared/schema";
import { eq, desc } from "drizzle-orm";

export class FieldServiceService {

    static async createWorkOrder(data: any) {
        // Generate WO Number (Simple Random for now)
        const woNumber = `WO-${Math.floor(Math.random() * 1000000)}`;

        const [wo] = await db.insert(serviceWorkOrders).values({
            ...data,
            workOrderNumber: woNumber,
            status: "New"
        }).returning();
        return wo;
    }

    static async assignTechnician(workOrderId: string, technicianId: string, scheduledStart: Date, scheduledEnd: Date) {
        // Create Appointment
        const [appt] = await db.insert(serviceAppointments).values({
            workOrderId,
            technicianId,
            scheduledStart,
            scheduledEnd,
            status: "Scheduled"
        }).returning();

        // Update WO Status
        await db.update(serviceWorkOrders)
            .set({ status: "Scheduled" })
            .where(eq(serviceWorkOrders.id, workOrderId));

        return appt;
    }

    static async completeWorkOrder(workOrderId: string) {
        const [wo] = await db.update(serviceWorkOrders)
            .set({ status: "Completed" })
            .where(eq(serviceWorkOrders.id, workOrderId))
            .returning();

        // Also complete any open appointments
        await db.update(serviceAppointments)
            .set({ status: "Completed", actualEnd: new Date() })
            .where(eq(serviceAppointments.workOrderId, workOrderId));

        return wo;
    }

    static async getWorkOrderDetails(id: string) {
        const [wo] = await db.select().from(serviceWorkOrders).where(eq(serviceWorkOrders.id, id));
        if (!wo) throw new Error("Work Order not found");

        const appointments = await db.select()
            .from(serviceAppointments)
            .where(eq(serviceAppointments.workOrderId, id))
            .orderBy(desc(serviceAppointments.scheduledStart));

        let linkedCase = null;
        if (wo.caseId) {
            [linkedCase] = await db.select().from(cases).where(eq(cases.id, wo.caseId));
        }

        return {
            workOrder: wo,
            appointments,
            linkedCase
        };
    }

    static async getDispatcherQueue() {
        // Unassigned or Scheduled but not completed
        return await db.select()
            .from(serviceWorkOrders)
            .where(eq(serviceWorkOrders.status, 'New'))
            .orderBy(desc(serviceWorkOrders.createdAt));
    }
}
