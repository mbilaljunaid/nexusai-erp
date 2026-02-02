import { db } from "../db";
import { hrmLearningCourses, hrmLearningOfferings, hrmLearningEnrollments } from "@shared/schema/talent_learning";
import { eq, desc, ilike, and } from "drizzle-orm";

export class LearningService {

    // COURSES (Catalog)
    static async searchCatalog(tenantId: string, query?: string) {
        let dbQuery = db.select().from(hrmLearningCourses).where(eq(hrmLearningCourses.tenantId, tenantId)).$dynamic();

        if (query) {
            dbQuery = dbQuery.where(and(
                eq(hrmLearningCourses.tenantId, tenantId),
                ilike(hrmLearningCourses.title, `%${query}%`)
            ));
        } else {
            dbQuery = dbQuery.orderBy(desc(hrmLearningCourses.createdAt));
        }

        return await dbQuery;
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
}
