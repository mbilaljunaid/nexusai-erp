import { db } from "@db";
import {
    hrLocations, hrOrganizations, hrJobs, hrPositions, hrGrades,
    insertLocationSchema, insertOrganizationSchema, insertJobSchema, insertGradeSchema, insertPositionSchema
} from "@shared/schema/hr_structures";
import { eq, and } from "drizzle-orm";

export class WorkforceStructuresService {

    // LOCATIONS
    static async createLocation(data: unknown, tenantId: string) {
        const validated = insertLocationSchema.parse({ ...data as any, tenantId });
        const result = await db.insert(hrLocations).values(validated).returning();
        return result[0];
    }

    static async listLocations(tenantId: string) {
        return db.select().from(hrLocations).where(eq(hrLocations.tenantId, tenantId));
    }

    // ORGANIZATIONS
    static async createOrganization(data: unknown, tenantId: string) {
        const validated = insertOrganizationSchema.parse({ ...data as any, tenantId });
        const result = await db.insert(hrOrganizations).values(validated).returning();
        return result[0];
    }

    static async listOrganizations(tenantId: string, classification?: string) {
        if (classification) {
            return db.select().from(hrOrganizations).where(
                and(
                    eq(hrOrganizations.tenantId, tenantId),
                    eq(hrOrganizations.classificationCode, classification)
                )
            );
        }
        return db.select().from(hrOrganizations).where(eq(hrOrganizations.tenantId, tenantId));
    }

    static async getOrganizationTree(tenantId: string) {
        // TODO: Implement recursive CTE for tree structure
        return this.listOrganizations(tenantId);
    }

    // JOBS
    static async createJob(data: unknown, tenantId: string) {
        const validated = insertJobSchema.parse({ ...data as any, tenantId });
        const result = await db.insert(hrJobs).values(validated).returning();
        return result[0];
    }

    static async listJobs(tenantId: string) {
        return db.select().from(hrJobs).where(eq(hrJobs.tenantId, tenantId));
    }

    // GRADES
    static async createGrade(data: unknown, tenantId: string) {
        const validated = insertGradeSchema.parse({ ...data as any, tenantId });
        const result = await db.insert(hrGrades).values(validated).returning();
        return result[0];
    }

    static async listGrades(tenantId: string) {
        return db.select().from(hrGrades).where(eq(hrGrades.tenantId, tenantId));
    }

    // POSITIONS
    static async createPosition(data: unknown, tenantId: string) {
        const validated = insertPositionSchema.parse({ ...data as any, tenantId });
        const result = await db.insert(hrPositions).values(validated).returning();
        return result[0];
    }

    static async listPositions(tenantId: string, departmentId?: string) {
        if (departmentId) {
            return db.select().from(hrPositions).where(
                and(eq(hrPositions.tenantId, tenantId), eq(hrPositions.departmentId, departmentId))
            );
        }
        return db.select().from(hrPositions).where(eq(hrPositions.tenantId, tenantId));
    }
}
