import { db } from "@db";
import { hrAor } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export class AorService {

    // Assign AOR to a user (e.g. HR Manager for Sales Dept)
    static async assignAor(data: typeof hrAor.$inferInsert) {
        return db.insert(hrAor).values(data).returning();
    }

    // Get AORs for a specific user (to determine what they can see)
    static async getAorForUser(personId: string, tenantId: string) {
        return db.select()
            .from(hrAor)
            .where(
                and(
                    eq(hrAor.personId, personId),
                    eq(hrAor.tenantId, tenantId),
                    eq(hrAor.isActive, true)
                )
            );
    }

    // List AORs (Admin view)
    static async listAors(tenantId: string) {
        return db.select().from(hrAor).where(eq(hrAor.tenantId, tenantId));
    }
}
