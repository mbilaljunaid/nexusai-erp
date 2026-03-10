
import { db } from "../db";
import { eq, and, lte, sql, inArray } from "drizzle-orm";
import { hrmLearningEnrollments, hrmLearningOfferings, hrmLearningCertifications, hrmLearningCourses } from "@shared/schema/talent_learning";
import { AuditService } from "./AuditService";

export class RecertificationService {

    // Run Daily Job
    static async checkExpirations(tenantId: string) {
        // 1. Find Completed Enrollments that are expiring soon
        // Logic: Enrollment.completionDate + ValidityMonths <= Now + RenewalWindow

        // For MVP/Demo: Simplified logic "Find Enrollments completed > 365 days ago"
        // In real app, we join with Certification rules.

        // Let's assume Course has 'validityMonths'.
        // We find enrollments where (completionDate + validityMonths) < (Now + 30 days) AND status != 'EXPIRED'

        const expiringEnrollments = await db.execute(sql`
            SELECT e.id, e.person_id, e.offering_id, e.completion_date, e.status, c.validity_months, c.id as course_id
            FROM hrm_learning_enrollments e
            JOIN hrm_learning_offerings o ON e.offering_id = o.id
            JOIN hrm_learning_courses c ON o.course_id = c.id
            WHERE e.tenant_id = ${tenantId}
            AND e.status = 'COMPLETED'
            AND c.validity_months IS NOT NULL
            AND (e.completion_date + (c.validity_months || ' months')::interval) <= (NOW() + interval '30 days')
            AND e.id NOT IN (
                -- Avoid duplicate renewals: check if there's already a newer enrollment for this course
                SELECT e2.id FROM hrm_learning_enrollments e2
                JOIN hrm_learning_offerings o2 ON e2.offering_id = o2.id
                WHERE e2.person_id = e.person_id 
                AND o2.course_id = c.id 
                AND e2.created_at > e.created_at
            )
        `);

        // 2. Process Renewals
        const renewals = expiringEnrollments.rows;
        console.log(`[RECERT] Found ${renewals.length} expiring enrollments.`);

        for (const record of renewals) {
            await this.renew(record, tenantId);
        }

        return { processed: renewals.length };
    }

    static async renew(record: any, tenantId: string) {
        // 1. Mark old as EXPIRED (Optional, or just leave as History)
        // 2. Create NEW Enrollment (Auto-enroll in same offering or latest offering)
        // For MVP: Re-enroll in SAME offering (Simulating "Retake")

        console.log(`[RECERT] Renewing ${record.person_id} for Course ${record.course_id}`);

        // A. Create New Enrollment
        const [newEnrollment] = await db.insert(hrmLearningEnrollments).values({
            tenantId,
            personId: record.person_id,
            offeringId: record.offering_id, // Ideally find "Current Active Offering", but reusing ID for simplicity
            status: "ENROLLED",
            progressPercent: 0
        }).returning();

        // B. Audit
        await AuditService.log(
            tenantId,
            "AUTO_RENEWAL",
            "ENROLLMENT",
            newEnrollment.id,
            { previous: record.id, new: "Renewed due to expiration" },
            "SYSTEM_RECERT_JOB"
        );
    }
}
