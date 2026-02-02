
import { db } from "../db";
import { hrmLearningAssessments, hrmLearningAssessmentQuestions, hrmLearningAssessmentAttempts, hrmLearningEnrollments } from "@shared/schema/talent_learning";
import { eq, and } from "drizzle-orm";

export class AssessmentService {

    // Create Assessment
    static async createAssessment(data: any) {
        const [assessment] = await db.insert(hrmLearningAssessments).values(data).returning();
        return assessment;
    }

    // Add Question
    static async addQuestion(data: any) {
        const [question] = await db.insert(hrmLearningAssessmentQuestions).values(data).returning();
        return question;
    }

    // Get Assessment (with Questions)
    static async getAssessment(assessmentId: string) {
        const assessment = await db.query.hrmLearningAssessments.findFirst({
            where: eq(hrmLearningAssessments.id, assessmentId)
        });
        if (!assessment) return null;

        const questions = await db.select().from(hrmLearningAssessmentQuestions)
            .where(eq(hrmLearningAssessmentQuestions.assessmentId, assessmentId));

        return { ...assessment, questions };
    }

    // Submit Attempt
    static async submitAttempt(tenantId: string, enrollmentId: string, assessmentId: string, answers: any) {
        // 1. Fetch Questions for Grading
        const questions = await db.select().from(hrmLearningAssessmentQuestions)
            .where(eq(hrmLearningAssessmentQuestions.assessmentId, assessmentId));

        // 2. Calculate Score
        let totalPoints = 0;
        let earnedPoints = 0;

        questions.forEach(q => {
            totalPoints += (q.points || 0);
            const studentAnswer = answers[q.id];
            // Simple string comparison for MVP
            if (studentAnswer && String(studentAnswer) === String(q.correctAnswer)) {
                earnedPoints += (q.points || 0);
            }
        });

        // 3. Determine Pass/Fail
        const assessment = await db.query.hrmLearningAssessments.findFirst({
            where: eq(hrmLearningAssessments.id, assessmentId)
        });

        const passed = earnedPoints >= (assessment?.passingScore || 80);

        // 4. Record Attempt
        const [attempt] = await db.insert(hrmLearningAssessmentAttempts).values({
            tenantId,
            enrollmentId,
            assessmentId,
            score: earnedPoints,
            passed,
            answers,
            completedAt: new Date()
        }).returning();

        // 5. Update Enrollment if Passed
        if (passed) {
            await db.update(hrmLearningEnrollments).set({
                status: "COMPLETED",
                score: earnedPoints,
                completionDate: new Date().toISOString()
            }).where(eq(hrmLearningEnrollments.id, enrollmentId));
        }

        return attempt;
    }
}
