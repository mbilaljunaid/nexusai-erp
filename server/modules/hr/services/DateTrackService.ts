/**
 * DateTrackService
 *
 * Implements Oracle Fusion–style row-level DateTrack for HR Assignments.
 * Every time an assignment is created, transferred, or terminated, this service
 * writes a full snapshot row into `hrAssignmentHistory`.
 *
 * Mode semantics (mirrors Oracle):
 *   INITIAL   - first-ever assignment record at time of hire
 *   UPDATE    - forward-dated change (transfer, promotion) — creates new effective period
 *   CORRECTION - back-dated fix to an existing period (retro-correction)
 *   FUTURE    - future-dated change not yet effective
 *   TERMINATE - assignment ended via termination action
 */

import { db } from "@db";
import { hrAssignmentHistory } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export type DateTrackMode = "INITIAL" | "UPDATE" | "CORRECTION" | "FUTURE" | "TERMINATE";

export interface DateTrackHistoryPayload {
    /** The current / new state of the assignment row */
    assignment: Record<string, unknown>;
    /** DateTrack mode for this change */
    mode: DateTrackMode;
    /** Effective date of this change — used as both the history row date and the snapshot effectiveStartDate */
    effectiveDate: string;
    /** ISO date up to which this snapshot is valid; null = open-ended */
    effectiveEndDate?: string | null;
    /** Who triggered the change */
    actorId?: string;
    /** Tenant scoping */
    tenantId: string;
    /** Human-readable description of the change */
    changeReason?: string;
}

export class DateTrackService {
    /**
     * Write a DateTrack history snapshot.
     * Pass a Drizzle transaction `tx` when calling inside an existing transaction (recommended).
     * Falls back to `db` if no `tx` supplied.
     */
    static async writeHistory(payload: DateTrackHistoryPayload, tx?: typeof db): Promise<void> {
        const executor = (tx ?? db) as typeof db;

        const {
            assignment,
            mode,
            effectiveDate,
            effectiveEndDate = null,
            actorId = "system",
            tenantId,
            changeReason,
        } = payload;

        const assignmentId = assignment.id as string;
        const personId = (assignment.personId ?? assignment.person_id) as string;

        if (!assignmentId || !personId) {
            console.warn(
                "[DateTrackService] Skipping history write — assignmentId or personId missing.",
                { mode, effectiveDate }
            );
            return;
        }

        // Determine the previous snapshot's version number
        const prevRows = await (executor as any).select({ v: hrAssignmentHistory.version })
            .from(hrAssignmentHistory)
            .where(
                and(
                    eq(hrAssignmentHistory.assignmentId, assignmentId),
                    eq(hrAssignmentHistory.tenantId, tenantId)
                )
            )
            .orderBy(desc(hrAssignmentHistory.version))
            .limit(1);

        const nextVersion = prevRows.length > 0 ? (prevRows[0].v ?? 0) + 1 : 1;

        // Build snapshot — a safe JSON copy of the assignment at this point in time
        const snapshot: Record<string, unknown> = {};
        const SNAPSHOT_FIELDS = [
            "assignmentNumber",
            "assignmentStatus",
            "primaryAssignmentFlag",
            "jobId",
            "departmentId",
            "locationId",
            "gradeId",
            "positionId",
            "managerId",
            "workRelationshipId",
            "effectiveStartDate",
            "effectiveEndDate",
            "workingHours",
            "workingHoursFrequency",
            "fte",
            "probationEndDate",
        ];

        for (const field of SNAPSHOT_FIELDS) {
            // Support both camelCase and snake_case layouts in the source object
            if (assignment[field] !== undefined) {
                snapshot[field] = assignment[field];
            } else {
                // Try snake_case alternative
                const snake = field.replace(/([A-Z])/g, "_$1").toLowerCase();
                if (assignment[snake] !== undefined) {
                    snapshot[field] = assignment[snake];
                }
            }
        }

        await (executor as any).insert(hrAssignmentHistory).values({
            assignmentId,
            personId,
            tenantId,
            version: nextVersion,
            dateTrackMode: mode,
            effectiveDate,
            effectiveEndDate: effectiveEndDate as string | null,
            assignmentSnapshot: snapshot,
            changedBy: actorId,
            changeReason: changeReason ?? null,
            createdAt: new Date(),
        });
    }

    /**
     * Convenience: read all history rows for an assignment, most-recent first.
     */
    static async getHistory(assignmentId: string, tenantId: string) {
        return db
            .select()
            .from(hrAssignmentHistory)
            .where(
                and(
                    eq(hrAssignmentHistory.assignmentId, assignmentId),
                    eq(hrAssignmentHistory.tenantId, tenantId)
                )
            )
            .orderBy(desc(hrAssignmentHistory.version));
    }

    /**
     * Convenience: read history for a person (all their assignments).
     */
    static async getPersonHistory(personId: string, tenantId: string) {
        return db
            .select()
            .from(hrAssignmentHistory)
            .where(
                and(
                    eq(hrAssignmentHistory.personId, personId),
                    eq(hrAssignmentHistory.tenantId, tenantId)
                )
            )
            .orderBy(desc(hrAssignmentHistory.effectiveDate), desc(hrAssignmentHistory.version));
    }
}
