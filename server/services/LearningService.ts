import { db } from "../db";
import { hrmLearningCourses, hrmLearningOfferings, hrmLearningEnrollments, hrmLearningContentItems, hrmLearningCertifications } from "@shared/schema/talent_learning";
import { eq, desc, ilike, and } from "drizzle-orm";

export class LearningService {

    // COURSES (Catalog)
    static async searchCatalog(tenantId: string, filters: { query?: string, category?: string, provider?: string, page?: number, pageSize?: number } = {}) {
        let conditions = [eq(hrmLearningCourses.tenantId, tenantId)];

        if (filters.query) {
            conditions.push(ilike(hrmLearningCourses.title, `%${filters.query}%`));
        }
        if (filters.category && filters.category !== "ALL") {
            conditions.push(eq(hrmLearningCourses.category, filters.category));
        }
        if (filters.provider && filters.provider !== "ALL") {
            conditions.push(eq(hrmLearningCourses.provider, filters.provider));
        }

        // Count Total
        const [countResult] = await db.select({ count: sql<number>`count(*)` })
            .from(hrmLearningCourses)
            .where(and(...conditions));

        const total = Number(countResult.count);

        // Pagination
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 100; // Default large for backward compat if not provided
        const offset = (page - 1) * pageSize;

        const data = await db.select().from(hrmLearningCourses)
            .where(and(...conditions))
            .orderBy(desc(hrmLearningCourses.createdAt))
            .limit(pageSize)
            .offset(offset);

        return { data, total };
    }

    static async createCourse(data: any) {
        const [course] = await db.insert(hrmLearningCourses).values(data).returning();
        return course;
    }

    // OFFERINGS
    static async getOfferings(courseId: string) {
        return await db.select().from(hrmLearningOfferings)
            .where(eq(hrmLearningOfferings.courseId, courseId))
            .orderBy(desc(hrmLearningOfferings.startDate));
    }

    static async createOffering(data: any) {
        const [offering] = await db.insert(hrmLearningOfferings).values(data).returning();
        return offering;
    }

    // ENROLLMENTS
    static async getMyLearning(personId: string) {
        // In a real app we'd join with Offerings and Courses to get titles
        // For MVP, simplistic fetch
        return await db.select({
            enrollmentId: hrmLearningEnrollments.id,
            status: hrmLearningEnrollments.status,
            progress: hrmLearningEnrollments.progressPercent,
            offeringId: hrmLearningOfferings.id,
            courseTitle: hrmLearningCourses.title,
            startDate: hrmLearningOfferings.startDate,
            type: hrmLearningOfferings.type
        })
            .from(hrmLearningEnrollments)
            .innerJoin(hrmLearningOfferings, eq(hrmLearningEnrollments.offeringId, hrmLearningOfferings.id))
            .innerJoin(hrmLearningCourses, eq(hrmLearningOfferings.courseId, hrmLearningCourses.id))
            .where(eq(hrmLearningEnrollments.personId, personId));
    }

    static async enroll(data: any) {
        // Check if already enrolled
        const existing = await db.select().from(hrmLearningEnrollments)
            .where(and(
                eq(hrmLearningEnrollments.personId, data.personId),
                eq(hrmLearningEnrollments.offeringId, data.offeringId)
            ));

        if (existing.length > 0) throw new Error("Already enrolled in this offering");

        const [enrollment] = await db.insert(hrmLearningEnrollments).values(data).returning();

        // Increment offering count
        // await db.update(hrmLearningOfferings).set({ enrolledCount: sql`enrolled_count + 1` })...

        return enrollment;
    }

    static async getEnrollmentDetails(enrollmentId: string) {
        const [result] = await db.select({
            enrollmentId: hrmLearningEnrollments.id,
            status: hrmLearningEnrollments.status,
            completionDate: hrmLearningEnrollments.completionDate,
            personId: hrmLearningEnrollments.personId,
            courseTitle: hrmLearningCourses.title,
            provider: hrmLearningCourses.provider,
            duration: hrmLearningCourses.durationMinutes,
            offeringId: hrmLearningOfferings.id
        })
            .from(hrmLearningEnrollments)
            .innerJoin(hrmLearningOfferings, eq(hrmLearningEnrollments.offeringId, hrmLearningOfferings.id))
            .innerJoin(hrmLearningCourses, eq(hrmLearningOfferings.courseId, hrmLearningCourses.id))
            .where(eq(hrmLearningEnrollments.id, enrollmentId))
            .limit(1);

        return result;
    }

    // CONTENT ITEMS (SCORM/Video)
    static async listContentItems(tenantId: string) {
        return await db.select().from(hrmLearningContentItems)
            .where(eq(hrmLearningContentItems.tenantId, tenantId))
            .orderBy(desc(hrmLearningContentItems.createdAt));
    }

    static async createContentItem(data: any) {
        const [item] = await db.insert(hrmLearningContentItems).values(data).returning();
        return item;
    }

    // CERTIFICATIONS
    static async listCertifications(tenantId: string) {
        return await db.select().from(hrmLearningCertifications)
            .where(eq(hrmLearningCertifications.tenantId, tenantId))
            .orderBy(desc(hrmLearningCertifications.createdAt));
    }

    static async createCertification(data: any) {
        const [cert] = await db.insert(hrmLearningCertifications).values(data).returning();
        return cert;
    }
}
