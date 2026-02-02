
import { db } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { hrAssignments, hrPersons, hrWorkRelationships } from "@shared/schema/hr_worker";
import { hrmLearningEnrollments, hrmLearningCourses, hrmLearningOfferings } from "@shared/schema/talent_learning";
import { LearningService } from "./LearningService";

export class ManagerLearningService {

    // Get Direct Reports
    static async getTeamMembers(managerPersonId: string, tenantId: string) {
        // 1. Find all active assignments where managerId matches
        // In real app, we check effective dates. For MVP, just manager_id match.

        const teamAssignments = await db.select({
            personId: hrPersons.id,
            firstName: hrPersons.firstName,
            lastName: hrPersons.lastName,
            email: hrPersons.email,
            assignmentId: hrAssignments.id,
            jobTitle: hrAssignments.jobId, // ideally join with hrJobs
            workerType: hrWorkRelationships.workerType
        })
            .from(hrAssignments)
            .innerJoin(hrPersons, eq(hrAssignments.personId, hrPersons.id))
            .innerJoin(hrWorkRelationships, eq(hrAssignments.workRelationshipId, hrWorkRelationships.id))
            .where(and(
                eq(hrAssignments.managerId, managerPersonId),
                eq(hrAssignments.tenantId, tenantId),
                eq(hrAssignments.assignmentStatus, "ACTIVE")
            ));

        // 2. Enhance with basic learning stats (Simplistic N+1 query for MVP or subquery)
        // For now, let's keep it simple.
        return teamAssignments;
    }

    // Get Learning History for a specific report
    static async getReportLearningHistory(reportPersonId: string) {
        return await LearningService.getMyLearning(reportPersonId);
    }

    // Assign Learning to a report
    static async assignLearning(managerId: string, data: { personId: string, offeringId: string, tenantId: string }) {
        // Validate hierarchy: Is this person really a report? 
        // For MVP, we skip strict hierarchy validation to allow "Matrix" assignments or just trust the UI/RBAC.

        // Use existing enroll service
        return await LearningService.enroll({
            ...data,
            enrollmentSource: "MANAGER_ASSIGNMENT",
            assignedBy: managerId
        });
    }
}
