
import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";
import { hrmLearningEnrollments, hrmLearningOfferings, hrmLearningCourses, hrmLearningContentItems } from "@shared/schema/talent_learning";

export class ContentDeliveryService {

    // 1. LAUNCH CONTENT
    // Verifies enrollment and returns the content URL + session context
    static async getLaunchData(enrollmentId: string, tenantId: string, userId: string) {
        // Validation: Verify Enrollment belongs to user
        const [enrollment] = await db.select({
            id: hrmLearningEnrollments.id,
            status: hrmLearningEnrollments.status,
            courseId: hrmLearningOfferings.courseId,
            offeringId: hrmLearningEnrollments.offeringId
        })
            .from(hrmLearningEnrollments)
            .innerJoin(hrmLearningOfferings, eq(hrmLearningEnrollments.offeringId, hrmLearningOfferings.id))
            .where(and(
                eq(hrmLearningEnrollments.id, enrollmentId),
                eq(hrmLearningEnrollments.tenantId, tenantId),
                eq(hrmLearningEnrollments.personId, userId)
            ));

        if (!enrollment) throw new Error("Enrollment not found or access denied.");

        // Fetch Content Item (Simple logic: Course has one content item for MVP)
        // In real app: Course -> Modules -> Content Items. Here assume 1-to-1 mapping via title/logic or joined table.
        // For MVP: We will look for a content item that "matches" the course or just return a mock if none linked.

        // Let's assume for MVP `hrmLearningContentItems` are linked loosely or we mock the URL.
        // REAL IMPLEMENTATION: SELECT url, type, launchData FROM content_items WHERE course_id = ...

        // MOCK PAYLOAD for Phase 5 Verification
        return {
            enrollmentId: enrollment.id,
            studentName: "Student", // Fetch actual name if needed
            contentType: "VIDEO", // or SCORM_12
            contentUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Mock Video
            initialStatus: enrollment.status,
            trackingToken: "secure-token-" + Date.now()
        };
    }

    // 2. TRACK PROGRESS
    // Updates status, time spent, score
    static async trackProgress(enrollmentId: string, data: { status: string, score?: number, timeSpentSeconds?: number }) {
        const updateData: any = {
            updatedAt: new Date()
        };

        if (data.status) updateData.status = data.status;
        if (data.score !== undefined) updateData.score = data.score;

        // If completed, set date
        if (data.status === "COMPLETED") {
            updateData.completionDate = sql`CURRENT_DATE`;
            updateData.progressPercent = 100;
        } else if (data.status === "IN_PROGRESS") {
            updateData.progressPercent = 50; // Simple logic
        }

        await db.update(hrmLearningEnrollments)
            .set(updateData)
            .where(eq(hrmLearningEnrollments.id, enrollmentId));

        return { success: true, status: data.status };
    }
}
