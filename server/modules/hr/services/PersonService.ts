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
    private static maskSensitiveData(person: any, hasFullAccess: boolean) {
        if (!person) return person;
        const maskedPerson = { ...person };
        if (!hasFullAccess) {
            if (maskedPerson.dateOfBirth) maskedPerson.dateOfBirth = "1900-01-01"; // Generic mask for date type consistency
            if (maskedPerson.nationalId) {
                const nid = String(maskedPerson.nationalId);
                maskedPerson.nationalId = "***-**-" + nid.slice(-4);
            }
        }
        return maskedPerson;
    }

    private static async hasAorAccess(requesterId: string, personId: string, tenantId: string): Promise<boolean> {
        if (!requesterId || requesterId === "system") return true;
        if (requesterId === personId) return true; // Self-access

        const userAors = await AorService.getAorForUser(requesterId, tenantId);
        // If user has no AORs, currently we assume Admin (View All). 
        // In a final hardened system, we'd check for a specific 'SUPER_USER' role here.
        if (userAors.length === 0) return true;

        const personAss = await db.select()
            .from(hrAssignments)
            .leftJoin(hrWorkRelationships, eq(hrAssignments.workRelationshipId, hrWorkRelationships.id))
            .where(and(
                eq(hrAssignments.personId, personId),
                eq(hrAssignments.assignmentStatus, "ACTIVE"),
                eq(hrAssignments.primaryAssignmentFlag, true)
            )).limit(1);

        if (!personAss.length) return false;
        const asg = personAss[0].hr_assignments;
        const rel = personAss[0].hr_work_relationships;

        return userAors.some(a => {
            if (a.scopeType === 'DEPARTMENT' && a.scopeValueId === asg.departmentId) return true;
            if (a.scopeType === 'LOCATION' && a.scopeValueId === asg.locationId) return true;
            if (a.scopeType === 'LEGAL_EMPLOYER' && rel && a.scopeValueId === rel.legalEmployerId) return true;
            return false;
        });
    }

    // Audit helper now uses the centralized service
    private static async logAudit(tx: any, params: {
        tenantId: string,
        actorId: string,
        entityType: string,
        entityId: string,
        action: string,
        changes?: Record<string, any>
    }) {
        await AuditLogService.log(params, tx);
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

    /**
     * Centralized masking logic for PII fields.
     */
    private static maskResults(data: any[], currentUserId: string, tenantId: string, isAdminOverride: boolean = false) {
        if (isAdminOverride) return data;

        // This is a simplified version; in production, we would pre-fetch AORs 
        // to avoid N+1 masking calls.
        return data.map(person => this.maskSensitiveData(person, false));
    }

    // PAGINATED SEARCH
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
        const refDate = new Date(effectiveDate);

        // 1. AOR Security Check (Filter)
        const aorConditions = [];
        let isAdminOverride = false;

        if (currentUserId && currentUserId !== "system") {
            const userAors = await AorService.getAorForUser(currentUserId, tenantId);

            // Tier-1 Rule: If user has NO AORs and is NOT a system user, 
            // we check for an admin override (simplified here to length check).
            if (userAors.length === 0) {
                isAdminOverride = true;
            } else {
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
                eq(hrWorkRelationships.primaryFlag, true)
            ))
            .leftJoin(hrAssignments, and(
                eq(hrAssignments.workRelationshipId, hrWorkRelationships.id),
                eq(hrAssignments.primaryAssignmentFlag, true)
            ))
            .where(whereClause);

        const rawData = await db.select({
            id: hrPersons.id,
            personNumber: hrPersons.personNumber,
            firstName: hrPersons.firstName,
            lastName: hrPersons.lastName,
            email: hrPersons.email,
            department: hrOrganizations.name,
            job: hrJobs.name,
            assignmentStatus: hrAssignments.assignmentStatus,
            nationalId: hrPersons.nationalId, // Include for masking
            dateOfBirth: hrPersons.dateOfBirth // Include for masking
        })
            .from(hrPersons)
            .leftJoin(hrWorkRelationships, and(
                eq(hrWorkRelationships.personId, hrPersons.id),
                eq(hrWorkRelationships.primaryFlag, true)
            ))
            .leftJoin(hrAssignments, and(
                eq(hrAssignments.workRelationshipId, hrWorkRelationships.id),
                eq(hrAssignments.primaryAssignmentFlag, true)
            ))
            .leftJoin(hrOrganizations, eq(hrAssignments.departmentId, hrOrganizations.id))
            .leftJoin(hrJobs, eq(hrAssignments.jobId, hrJobs.id))
            .where(whereClause)
            .limit(limit)
            .offset(offset);

        // 2. Data Privacy Masking (Field-Level)
        const maskedData = this.maskResults(rawData, currentUserId || "guest", tenantId, isAdminOverride);

        return {
            data: maskedData,
            total: totalCount.count,
            page,
            limit
        };
    }

    // GET FULL PROFILE
    static async getPersonProfile(personId: string, tenantId: string, currentUserId?: string) {
        const personData = await db.query.hrPersons.findFirst({
            where: and(eq(hrPersons.id, personId), eq(hrPersons.tenantId, tenantId)),
        });

        if (!personData) return null;

        const hasAccess = currentUserId ? await this.hasAorAccess(currentUserId, personId, tenantId) : true;
        const person = this.maskSensitiveData(personData, hasAccess);

        const relationships = await db.select().from(hrWorkRelationships)
            .where(eq(hrWorkRelationships.personId, personId));

        const assignments = await db.select().from(hrAssignments)
            .where(eq(hrAssignments.personId, personId));

        return { person, relationships, assignments };
    }

    static async getRecentTransactions(tenantId: string, limit: number = 50, currentUserId?: string) {
        const rawData = await db.select({
            id: hrAssignments.id,
            updatedAt: hrAssignments.updatedAt,
            updatedBy: hrAssignments.updatedBy,
            personId: hrPersons.id,
            personName: sql`concat(${hrPersons.firstName}, ' ', ${hrPersons.lastName})`,
            assignmentStatus: hrAssignments.assignmentStatus,
            assignmentNumber: hrAssignments.assignmentNumber,
            dept: hrOrganizations.name,
            job: hrJobs.name,
            nationalId: hrPersons.nationalId, // For masking
            dateOfBirth: hrPersons.dateOfBirth // For masking
        })
            .from(hrAssignments)
            .leftJoin(hrPersons, eq(hrAssignments.personId, hrPersons.id))
            .leftJoin(hrOrganizations, eq(hrAssignments.departmentId, hrOrganizations.id))
            .leftJoin(hrJobs, eq(hrAssignments.jobId, hrJobs.id))
            .where(eq(hrAssignments.tenantId, tenantId))
            .orderBy(desc(hrAssignments.updatedAt))
            .limit(limit);

        // Apply AOR Masking
        return this.maskResults(rawData, currentUserId || "guest", tenantId);
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
