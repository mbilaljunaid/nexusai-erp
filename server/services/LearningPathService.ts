
import { db } from "../db";
import { hrmLearningCurricula, hrmLearningCurriculumMembers, hrmLearningCourses } from "@shared/schema/talent_learning";
import { eq, and, asc } from "drizzle-orm";

export class LearningPathService {

    // Create Curriculum
    static async createCurriculum(data: any) {
        const [curriculum] = await db.insert(hrmLearningCurricula).values(data).returning();
        return curriculum;
    }

    // List Curricula
    static async listCurricula(tenantId: string) {
        return await db.select().from(hrmLearningCurricula)
            .where(eq(hrmLearningCurricula.tenantId, tenantId));
    }

    // Add Course to Curriculum
    static async addCourse(tenantId: string, curriculumId: string, courseId: string, sequenceOrder: number = 0) {
        const [member] = await db.insert(hrmLearningCurriculumMembers).values({
            tenantId,
            curriculumId,
            courseId,
            sequenceOrder
        }).returning();
        return member;
    }

    // Get Curriculum Details (with Courses)
    static async getCurriculumDetails(curriculumId: string) {
        const curriculum = await db.query.hrmLearningCurricula.findFirst({
            where: eq(hrmLearningCurricula.id, curriculumId)
        });

        if (!curriculum) return null;

        const members = await db.select({
            memberId: hrmLearningCurriculumMembers.id,
            sequence: hrmLearningCurriculumMembers.sequenceOrder,
            courseId: hrmLearningCourses.id,
            title: hrmLearningCourses.title,
            duration: hrmLearningCourses.durationMinutes
        })
            .from(hrmLearningCurriculumMembers)
            .innerJoin(hrmLearningCourses, eq(hrmLearningCurriculumMembers.courseId, hrmLearningCourses.id))
            .where(eq(hrmLearningCurriculumMembers.curriculumId, curriculumId))
            .orderBy(asc(hrmLearningCurriculumMembers.sequenceOrder));

        return { ...curriculum, courses: members };
    }
}
