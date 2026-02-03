import { db } from "@db";
import {
    hrPersons, hrWorkRelationships, hrAssignments,
    insertPersonSchema, insertWorkRelationshipSchema, insertAssignmentSchema,
    hrJobs, hrOrganizations, hrAuditLogs
} from "@shared/schema";
import { eq, and, like, or, sql, desc, count, ilike, lte, gte, isNull, inArray } from "drizzle-orm";
import { AorService } from "./AorService";
import { ComplianceEngineService } from "./ComplianceEngineService";

// Types for Paginated Response
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export class PersonService {

    // --- AUDIT HELPER ---
    private static async logAudit(tx: any, params: {
        tenantId: string,
        actorId: string,
        entityType: "PERSON" | "WORK_RELATIONSHIP" | "ASSIGNMENT",
        entityId: string,
        action: "HIRE" | "TERMINATE" | "TRANSFER" | "CREATE" | "UPDATE",
        changes?: Record<string, any>
    }) {
        await tx.insert(hrAuditLogs).values({
            tenantId: params.tenantId,
            actorId: params.actorId,
            entityType: params.entityType,
            entityId: params.entityId,
            action: params.action,
            changes: params.changes || {},
            timestamp: new Date()
        });
    }

    // HIRE WORKER
    static async hireWorker(data: {
        person: unknown;
        workRelationship: unknown;
        assignment: unknown;
    }, tenantId: string, actorId: string = "system") {

        return db.transaction(async (tx) => {
            // 1. Create Person
            const personData = insertPersonSchema.parse({
                ...data.person as any,
                tenantId,
                createdBy: actorId,
                updatedBy: actorId
            });
            const [person] = await tx.insert(hrPersons).values(personData).returning();
            await this.logAudit(tx, { tenantId, actorId, entityType: "PERSON", entityId: person.id, action: "HIRE", changes: personData });

            // 2. Create Work Relationship
            const relationshipData = insertWorkRelationshipSchema.parse({
                ...data.workRelationship as any,
                tenantId,
                personId: person.id,
                createdBy: actorId,
                updatedBy: actorId
            });
            const [relationship] = await tx.insert(hrWorkRelationships).values(relationshipData).returning();
            await this.logAudit(tx, { tenantId, actorId, entityType: "WORK_RELATIONSHIP", entityId: relationship.id, action: "CREATE", changes: relationshipData });

            // 3. Create Assignment
            const assignmentData = insertAssignmentSchema.parse({
                ...data.assignment as any,
                tenantId,
                personId: person.id,
                workRelationshipId: relationship.id,
                assignmentNumber: (data.assignment as any).assignmentNumber || ("E" + person.personNumber), // Auto-gen if missing
                effectiveStartDate: (data.assignment as any).effectiveStartDate || new Date().toISOString().split('T')[0], // Ensure string
                createdBy: actorId,
                updatedBy: actorId
            });
            const [assignment] = await tx.insert(hrAssignments).values(assignmentData).returning();
            await this.logAudit(tx, { tenantId, actorId, entityType: "ASSIGNMENT", entityId: assignment.id, action: "CREATE", changes: assignmentData });

            // 4. Evaluate Compliance
            await ComplianceEngineService.evaluateTransaction(tenantId, "PERSON", person.id, {
                ...personData,
                assignment: assignmentData,
                workRelationship: relationshipData
            });

            return { person, relationship, assignment };
        });
    }

    // TERMINATE WORKER
    static async terminateWorker(data: {
        personId: string;
        terminationDate: string; // YYYY-MM-DD
        reason?: string;
    }, tenantId: string, actorId: string = "system") {
        return db.transaction(async (tx) => {
            const { personId, terminationDate } = data;

            // 1. Get Active Work Relationship
            const activeRel = await tx.select().from(hrWorkRelationships).where(and(
                eq(hrWorkRelationships.personId, personId),
                eq(hrWorkRelationships.tenantId, tenantId),
                sql`${hrWorkRelationships.terminationDate} IS NULL`
            )).limit(1);

            if (!activeRel.length) {
                throw new Error("No active work relationship found for this person.");
            }
            const relationshipId = activeRel[0].id;

            // 2. Terminate Relationship
            const [updatedRel] = await tx.update(hrWorkRelationships)
                .set({
                    terminationDate: terminationDate,
                    updatedAt: new Date(),
                    updatedBy: actorId
                })
                .where(eq(hrWorkRelationships.id, relationshipId))
                .returning();

            await this.logAudit(tx, {
                tenantId, actorId, entityType: "WORK_RELATIONSHIP", entityId: relationshipId, action: "TERMINATE",
                changes: { terminationDate, reason: data.reason }
            });

            // 3. End-Date all Active Assignments
            // Note: In a real temporal system, we'd update each row. Here we just batch update active ones.
            await tx.update(hrAssignments)
                .set({
                    effectiveEndDate: terminationDate,
                    assignmentStatus: "INACTIVE",
                    updatedAt: new Date(),
                    updatedBy: actorId
                })
                .where(and(
                    eq(hrAssignments.workRelationshipId, relationshipId),
                    sql`${hrAssignments.effectiveEndDate} IS NULL`
                ));

            // Log implicit assignment termination
            await this.logAudit(tx, {
                tenantId, actorId, entityType: "ASSIGNMENT", entityId: "ALL_ACTIVE", action: "TERMINATE",
                changes: { effectiveEndDate: terminationDate }
            });

            // 4. Evaluate Compliance (Termination)
            await ComplianceEngineService.evaluateTransaction(tenantId, "WORK_RELATIONSHIP", relationshipId, {
                personId,
                terminationDate,
                reason: data.reason,
                status: "TERMINATED"
            });

            return updatedRel;
        });
    }

    // TRANSFER WORKER
    static async transferWorker(data: {
        personId: string;
        effectiveDate: string;
        newJobId?: string;
        newDepartmentId?: string;
        newLocationId?: string;
        newGradeId?: string;
        newPositionId?: string;
        reason?: string;
    }, tenantId: string, actorId: string = "system") {
        return db.transaction(async (tx) => {
            const { personId, effectiveDate } = data;

            const activeAsg = await tx.select().from(hrAssignments).where(and(
                eq(hrAssignments.personId, personId),
                eq(hrAssignments.assignmentStatus, "ACTIVE"),
                eq(hrAssignments.primaryAssignmentFlag, true),
                sql`${hrAssignments.effectiveEndDate} IS NULL`
            )).limit(1);

            if (!activeAsg.length) throw new Error("No active primary assignment found.");
            const currentAsg = activeAsg[0];

            // End Date Current
            const dayBefore = new Date(effectiveDate);
            dayBefore.setDate(dayBefore.getDate() - 1);
            const endDateStr = dayBefore.toISOString().split('T')[0];

            await tx.update(hrAssignments)
                .set({ effectiveEndDate: endDateStr, updatedAt: new Date(), updatedBy: actorId })
                .where(eq(hrAssignments.id, currentAsg.id));

            // Create New
            const newAsgData = insertAssignmentSchema.parse({
                ...currentAsg,
                id: undefined, createdAt: undefined, updatedAt: undefined,
                effectiveStartDate: effectiveDate,
                effectiveEndDate: null,
                jobId: data.newJobId || currentAsg.jobId,
                departmentId: data.newDepartmentId || currentAsg.departmentId,
                locationId: data.newLocationId || currentAsg.locationId,
                gradeId: data.newGradeId || currentAsg.gradeId,
                positionId: data.newPositionId || currentAsg.positionId,
                workRelationshipId: currentAsg.workRelationshipId,
                personId: currentAsg.personId,
                assignmentNumber: currentAsg.assignmentNumber + "-T", // Simple versioning
                createdBy: actorId, updatedBy: actorId
            });

            const [newAsg] = await tx.insert(hrAssignments).values(newAsgData).returning();

            await this.logAudit(tx, {
                tenantId, actorId, entityType: "ASSIGNMENT", entityId: newAsg.id, action: "TRANSFER",
                changes: { from: currentAsg.id, to: newAsg.id, reason: data.reason, ...data }
            });

            // 4. Evaluate Compliance (Transfer)
            await ComplianceEngineService.evaluateTransaction(tenantId, "ASSIGNMENT", newAsg.id, {
                ...newAsgData,
                reason: data.reason
            });

            return newAsg;
        });
    }

    // PAGINATED SEARCH
    // Updated search with AOR
    // Updated search with AOR & Effective Dating
    static async searchPersons(
        tenantId: string,
        query?: string,
        page: number = 1,
        limit: number = 20,
        currentUserId?: string, // Add context user
        effectiveDate: string = new Date().toISOString() // "As Of Date"
    ): Promise<PaginatedResult<any>> {
        const searchTerm = query ? `%${query}%` : "%";
        const offset = (page - 1) * limit;
        const refDate = new Date(effectiveDate); // Use this for comparisons

        // AOR Security Check
        const aorConditions = [];
        if (currentUserId) {
            const userAors = await AorService.getAorForUser(currentUserId, tenantId);

            // If user has AORs, restrict access. If no AORs, assume Admin (View All) for now to prevent lockout.
            if (userAors.length > 0) {
                const deptIds = userAors.filter(a => a.scopeType === 'DEPARTMENT').map(a => a.scopeValueId);
                const locIds = userAors.filter(a => a.scopeType === 'LOCATION').map(a => a.scopeValueId);
                const leIds = userAors.filter(a => a.scopeType === 'LEGAL_EMPLOYER').map(a => a.scopeValueId);

                const conditions = [];
                if (deptIds.length > 0) conditions.push(inArray(hrAssignments.departmentId, deptIds));
                if (locIds.length > 0) conditions.push(inArray(hrAssignments.locationId, locIds));
                if (leIds.length > 0) conditions.push(inArray(hrWorkRelationships.legalEmployerId, leIds));

                if (conditions.length > 0) {
                    aorConditions.push(or(...conditions));
                }
            }
        }

        const whereClause = and(
            eq(hrPersons.tenantId, tenantId),
            ...aorConditions,
            or(
                ilike(hrPersons.firstName, searchTerm),
                ilike(hrPersons.lastName, searchTerm),
                ilike(hrPersons.personNumber, searchTerm),
                ilike(hrPersons.email, searchTerm)
            )
        );

        const [totalCount] = await db.select({ count: count() })
            .from(hrPersons)
            .leftJoin(hrWorkRelationships, and(
                eq(hrWorkRelationships.personId, hrPersons.id),
                eq(hrWorkRelationships.primaryFlag, true),
                lte(hrWorkRelationships.dateStart, refDate.toISOString().split('T')[0]),
                or(isNull(hrWorkRelationships.terminationDate), gte(hrWorkRelationships.terminationDate, refDate.toISOString().split('T')[0]))
            ))
            .leftJoin(hrAssignments, and(
                eq(hrAssignments.workRelationshipId, hrWorkRelationships.id),
                eq(hrAssignments.primaryAssignmentFlag, true),
                lte(hrAssignments.effectiveStartDate, refDate.toISOString().split('T')[0]),
                or(isNull(hrAssignments.effectiveEndDate), gte(hrAssignments.effectiveEndDate, refDate.toISOString().split('T')[0]))
            ))
            // We might need Org/Jobs joins if we filter by them later, but for AOR (deptId is on Assignment), we just need Assignment.
            .where(whereClause);

        const data = await db.select({
            id: hrPersons.id,
            personNumber: hrPersons.personNumber,
            firstName: hrPersons.firstName,
            lastName: hrPersons.lastName,
            email: hrPersons.email,
            department: hrOrganizations.name,
            job: hrJobs.name,
            assignmentStatus: hrAssignments.assignmentStatus
        })
            .from(hrPersons)
            .leftJoin(hrWorkRelationships, and(
                eq(hrWorkRelationships.personId, hrPersons.id),
                eq(hrWorkRelationships.primaryFlag, true),
                // Work Rel effective check
                lte(hrWorkRelationships.dateStart, refDate.toISOString().split('T')[0]),
                or(isNull(hrWorkRelationships.terminationDate), gte(hrWorkRelationships.terminationDate, refDate.toISOString().split('T')[0]))
            ))
            .leftJoin(hrAssignments, and(
                eq(hrAssignments.workRelationshipId, hrWorkRelationships.id),
                eq(hrAssignments.primaryAssignmentFlag, true),
                // Assignment effective check
                lte(hrAssignments.effectiveStartDate, refDate.toISOString().split('T')[0]),
                or(isNull(hrAssignments.effectiveEndDate), gte(hrAssignments.effectiveEndDate, refDate.toISOString().split('T')[0]))
            ))
            .leftJoin(hrOrganizations, eq(hrAssignments.departmentId, hrOrganizations.id))
            .leftJoin(hrJobs, eq(hrAssignments.jobId, hrJobs.id))
            .where(whereClause)
            .limit(limit)
            .offset(offset);

        return {
            data,
            total: totalCount.count,
            page,
            limit
        };
    }

    // GET FULL PROFILE
    static async getPersonProfile(personId: string, tenantId: string) {
        const person = await db.query.hrPersons.findFirst({
            where: and(eq(hrPersons.id, personId), eq(hrPersons.tenantId, tenantId)),
        });

        if (!person) return null;

        const relationships = await db.select().from(hrWorkRelationships)
            .where(eq(hrWorkRelationships.personId, personId));

        const assignments = await db.select().from(hrAssignments)
            .where(eq(hrAssignments.personId, personId));

        return { person, relationships, assignments };
    }

    static async getRecentTransactions(tenantId: string, limit: number = 50) {
        return db.select({
            id: hrAssignments.id,
            updatedAt: hrAssignments.updatedAt,
            updatedBy: hrAssignments.updatedBy,
            personId: hrPersons.id,
            personName: sql`concat(${hrPersons.firstName}, ' ', ${hrPersons.lastName})`,
            assignmentStatus: hrAssignments.assignmentStatus,
            assignmentNumber: hrAssignments.assignmentNumber,
            dept: hrOrganizations.name,
            job: hrJobs.name
        })
            .from(hrAssignments)
            .leftJoin(hrPersons, eq(hrAssignments.personId, hrPersons.id))
            .leftJoin(hrOrganizations, eq(hrAssignments.departmentId, hrOrganizations.id))
            .leftJoin(hrJobs, eq(hrAssignments.jobId, hrJobs.id))
            .where(eq(hrAssignments.tenantId, tenantId))
            .orderBy(desc(hrAssignments.updatedAt))
            .limit(limit);
    }

    // ANALYTICS & DATA QUALITY
    static async getPeopleAnalytics(tenantId: string) {
        // 1. Data Quality Metrics
        const missingNid = await db.select({ count: sql<number>`count(*)` })
            .from(hrPersons)
            .where(and(eq(hrPersons.tenantId, tenantId), sql`${hrPersons.nationalId} IS NULL`));

        const missingManager = await db.select({ count: sql<number>`count(*)` })
            .from(hrAssignments)
            .where(and(
                eq(hrAssignments.tenantId, tenantId),
                eq(hrAssignments.assignmentStatus, 'ACTIVE'),
                sql`${hrAssignments.managerId} IS NULL`
            ));

        const totalActive = await db.select({ count: sql<number>`count(*)` })
            .from(hrAssignments)
            .where(and(eq(hrAssignments.tenantId, tenantId), eq(hrAssignments.assignmentStatus, 'ACTIVE')));

        // 2. Headcount by Department
        const headcountByDept = await db.select({
            dept: hrOrganizations.name,
            count: sql<number>`count(*)`
        })
            .from(hrAssignments)
            .leftJoin(hrOrganizations, eq(hrAssignments.departmentId, hrOrganizations.id))
            .where(and(eq(hrAssignments.tenantId, tenantId), eq(hrAssignments.assignmentStatus, 'ACTIVE')))
            .groupBy(hrOrganizations.name);

        return {
            quality: {
                missingNationalId: Number(missingNid[0]?.count || 0),
                missingManager: Number(missingManager[0]?.count || 0),
                totalActiveWorker: Number(totalActive[0]?.count || 0)
            },
            headcount: headcountByDept
        };
    }
}
