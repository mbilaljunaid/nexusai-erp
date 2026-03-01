import { db } from "../db";
import { hrmRecRequisitions, hrmRecCandidates, hrmRecApplications, hrmRecOffers, hrmRecInterviews, hrmRecOnboardingTasks } from "@shared/schema/talent_recruitment";
import { eq, desc, sql } from "drizzle-orm";
import { CompensationService } from "./CompensationService";
import { hrAssignments } from "@shared/schema/hr_worker";
import { hrmSalaryBases, hrmWorkerSalaries } from "@shared/schema/rewards_compensation";

export class RecruitmentService {

    // REQUISITIONS
    static async getRequisitions(tenantId: string, options: { limit?: number; offset?: number; entLegalEntityId?: string } = {}) {
        const { limit = 50, offset = 0, entLegalEntityId } = options;
        return await db.select().from(hrmRecRequisitions)
            .where(and(
                eq(hrmRecRequisitions.tenantId, tenantId),
                entLegalEntityId ? eq(hrmRecRequisitions.entLegalEntityId, entLegalEntityId) : sql`true`
            ))
            .orderBy(desc(hrmRecRequisitions.createdAt))
            .limit(limit)
            .offset(offset);
    }

    static async createRequisition(data: any) {
        // Auto-generate Requisition Number if missing
        if (!data.requisitionNumber) {
            const count = await db.select({ count: sql<number>`count(*)` }).from(hrmRecRequisitions);
            const num = Number(count[0]?.count || 0) + 1;
            data.requisitionNumber = `REQ-${new Date().getFullYear()}-${num.toString().padStart(3, '0')}`;
        }

        // Sanitize payload for V1 UI compatibility
        const payload: any = {
            tenantId: data.tenantId,
            requisitionNumber: data.requisitionNumber,
            title: data.title,
            status: data.stage ? data.stage.toUpperCase() : "OPEN",
            // Use logical OR for description
            description: data.description || "",
            // Add enterprise scope
            entLegalEntityId: data.entLegalEntityId,
            entBusinessUnitId: data.entBusinessUnitId
            // Provide dummy or null for departmentId if just a string name is sent
            // In a real app we would lookup the department ID by name
        };

        // If departmentId is provided (UUID), use it. If "department" name is provided, ignore or map.
        if (data.departmentId) payload.departmentId = data.departmentId;

        const [req] = await db.insert(hrmRecRequisitions).values(payload).returning();
        return req;
    }

    static async deleteRequisition(id: string, tenantId: string) {
        return await db.delete(hrmRecRequisitions)
            .where(eq(hrmRecRequisitions.id, id)) // Should also check tenantId for safety
            .returning();
    }

    // CANDIDATES
    static async getCandidates(tenantId: string, options: { limit?: number; offset?: number; maskPII?: boolean; entLegalEntityId?: string } = {}) {
        const { limit = 50, offset = 0, maskPII = true, entLegalEntityId } = options;
        const candidates = await db.select().from(hrmRecCandidates)
            .where(and(
                eq(hrmRecCandidates.tenantId, tenantId),
                // Candidates are technically global, but if we need to scope them by who they applied for:
                // We'd join applications. For now, we'll return all tenant candidates unless scoping added to schema.
                // Assuming candidates remain tenant-global for CRM purposes.
                sql`true`
            ))
            .orderBy(desc(hrmRecCandidates.createdAt))
            .limit(limit)
            .offset(offset);

        if (maskPII) {
            return candidates.map(c => ({
                ...c,
                email: "******",
                phone: "******"
            }));
        }
        return candidates;
    }

    static async createCandidate(data: any) {
        const [candidate] = await db.insert(hrmRecCandidates).values(data).returning();
        return candidate;
    }

    // APPLICATIONS
    static async applyForJob(data: any) {
        const [app] = await db.insert(hrmRecApplications).values(data).returning();
        return app;
    }

    // ACTIONS
    static async getApplications(requisitionId: string) {
        return await db.select().from(hrmRecApplications)
            .where(eq(hrmRecApplications.requisitionId, requisitionId));
    }

    static async getApplicationById(id: string) {
        const [app] = await db.select().from(hrmRecApplications).where(eq(hrmRecApplications.id, id));
        return app;
    }

    static async updateApplicationStatus(id: string, status: string, stage?: string) {
        const payload: any = { status, updatedAt: new Date() };
        if (stage) payload.stage = stage;

        const [app] = await db.update(hrmRecApplications)
            .set(payload)
            .where(eq(hrmRecApplications.id, id))
            .returning();
        return app;
    }

    static async createOffer(data: any) {
        // In a real app we'd check if application is in 'OFFER' stage
        return await db.transaction(async (tx) => {
            const [offer] = await tx.insert(hrmRecOffers).values(data).returning();
            // Auto-update application status
            await tx.update(hrmRecApplications)
                .set({ status: 'OFFER', stage: 'Offer Extension' })
                .where(eq(hrmRecApplications.id, data.applicationId));
            return offer;
        });
    }

    // WORKFLOWS
    static async submitOfferForApproval(offerId: string) {
        // Validations omitted for brevity
        const [offer] = await db.update(hrmRecOffers).set({ status: "PENDING_APPROVAL" }).where(eq(hrmRecOffers.id, offerId)).returning();
        return offer;
    }

    static async approveOffer(offerId: string, approverId: string) {
        const [offer] = await db.update(hrmRecOffers).set({ status: "APPROVED" }).where(eq(hrmRecOffers.id, offerId)).returning();

        // Optionally move application to 'OFFER_APPROVED'
        if (offer) {
            await db.update(hrmRecApplications)
                .set({ stage: 'Offer Approved' })
                .where(eq(hrmRecApplications.id, offer.applicationId));
        }
        return offer;
    }
    static async acceptOffer(offerId: string) {
        return await db.transaction(async (tx) => {
            // 1. Update Offer Status
            const [offer] = await tx.update(hrmRecOffers)
                .set({ status: "ACCEPTED", updatedAt: new Date() })
                .where(eq(hrmRecOffers.id, offerId))
                .returning();

            if (!offer) throw new Error("Offer not found");

            // 2. Fetch Application & Candidate
            const [app] = await tx.select().from(hrmRecApplications).where(eq(hrmRecApplications.id, offer.applicationId));
            const [candidate] = await tx.select().from(hrmRecCandidates).where(eq(hrmRecCandidates.id, app.candidateId));

            // 3. Integration: If Internal Candidate, Auto-Create Salary Assignment
            if (candidate && candidate.linkedPersonId) {
                // Find Primary Assignment
                const assignments = await tx.select().from(hrAssignments)
                    .where(eq(hrAssignments.personId, candidate.linkedPersonId));

                const primaryAssignment = assignments.find(a => a.primaryAssignmentFlag) || assignments[0];

                if (primaryAssignment) {
                    // Find or Create default Salary Basis (Annual USD)
                    // In real app, offer should specify Basis. We will default to the first available basis for V1.
                    const [defaultBasis] = await tx.select().from(hrmSalaryBases).limit(1);

                    if (defaultBasis) {
                        const salaryPayload = {
                            tenantId: offer.tenantId,
                            assignmentId: primaryAssignment.id,
                            salaryBasisId: defaultBasis.id,
                            amount: offer.baseSalary.toString(),
                            currency: offer.currency,
                            dateFrom: offer.startDate ? new Date(offer.startDate).toISOString() : new Date().toISOString(),
                            changeReason: "OFFER_ACCEPTED"
                        };

                        // Direct Insert (Logic from CompensationService.assignSalary but inside TX)
                        await tx.insert(hrmWorkerSalaries).values(salaryPayload);
                    }
                }
            }

            // 4. Update Application Stage
            await tx.update(hrmRecApplications)
                .set({ stage: 'Hired (Pending Start)', status: 'HIRED' })
                .where(eq(hrmRecApplications.id, offer.applicationId));

            // 5. Generate Onboarding Tasks (Trigger)
            // We call the static method but need to pass the TX if we want atomic, or just run it after. 
            // For now, let's just insert directly inside TX to be safe.
            const defaultTasks = [
                { taskName: "Provision Laptop", category: "IT", assignedTo: "IT_ADMIN" },
                { taskName: "Create Email Account", category: "IT", assignedTo: "IT_ADMIN" },
                { taskName: "Sign NDA", category: "LEGAL", assignedTo: "HR_OB_MGR" },
                { taskName: "Enroll in Benefits", category: "HR", assignedTo: "HR_OB_MGR" },
                { taskName: "Welcome Lunch", category: "FACILITIES", assignedTo: "HIRING_MGR" }
            ];

            for (const task of defaultTasks) {
                await tx.insert(hrmRecOnboardingTasks).values({
                    tenantId: offer.tenantId,
                    applicationId: offer.applicationId,
                    taskName: task.taskName,
                    category: task.category,
                    assignedTo: task.assignedTo
                });
            }

            return offer;
        });
    }

    // ONBOARDING
    static async getOnboardingProgress(tenantId: string) {
        // Fetch all Hired applications
        const hires = await db.select({
            app: hrmRecApplications,
            candidate: hrmRecCandidates,
            requisition: hrmRecRequisitions
        })
            .from(hrmRecApplications)
            .innerJoin(hrmRecCandidates, eq(hrmRecApplications.candidateId, hrmRecCandidates.id))
            .innerJoin(hrmRecRequisitions, eq(hrmRecApplications.requisitionId, hrmRecRequisitions.id))
            .where(eq(hrmRecApplications.status, "HIRED"));

        // For each hire, fetch task stats
        const results = await Promise.all(hires.map(async (row) => {
            const tasks = await db.select().from(hrmRecOnboardingTasks).where(eq(hrmRecOnboardingTasks.applicationId, row.app.id));
            const completed = tasks.filter(t => t.status === "COMPLETED").length;
            const total = tasks.length;
            const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

            return {
                id: row.app.id,
                candidateName: `${row.candidate.firstName} ${row.candidate.lastName}`,
                jobTitle: row.requisition.title,
                startDate: row.app.updatedAt, // Approximation
                progress,
                totalTasks: total,
                completedTasks: completed,
                tasks // Return full tasks for UI expansion
            };
        }));

        return results;
    }

    static async updateOnboardingTask(taskId: string, status: string) {
        const [task] = await db.update(hrmRecOnboardingTasks)
            .set({ status, completedAt: status === 'COMPLETED' ? new Date() : null })
            .where(eq(hrmRecOnboardingTasks.id, taskId))
            .returning();
        return task;
    }

    // ANALYTICS
    static async getAnalytics(tenantId: string) {
        // 1. Pipeline Funnel
        const apps = await db.select({ stage: hrmRecApplications.stage }).from(hrmRecApplications)
            .where(eq(hrmRecApplications.tenantId, tenantId));

        const funnel: Record<string, number> = {};
        apps.forEach(a => {
            const s = a.stage || "New";
            funnel[s] = (funnel[s] || 0) + 1;
        });

        // 2. Acceptance Rate
        const offers = await db.select({ status: hrmRecOffers.status }).from(hrmRecOffers)
            .where(eq(hrmRecOffers.tenantId, tenantId));

        const totalOffers = offers.length;
        const acceptedOffers = offers.filter(o => o.status === "ACCEPTED").length;
        const acceptanceRate = totalOffers > 0 ? Math.round((acceptedOffers / totalOffers) * 100) : 0;

        // 3. Time to Fill (Avg days from Req Creation to Offer Accept)
        // This is complex, requires joining Req -> App -> Offer
        const hiredOffers = await db.select({
            offerDate: hrmRecOffers.updatedAt,
            reqDate: hrmRecRequisitions.createdAt
        })
            .from(hrmRecOffers)
            .innerJoin(hrmRecApplications, eq(hrmRecOffers.applicationId, hrmRecApplications.id))
            .innerJoin(hrmRecRequisitions, eq(hrmRecApplications.requisitionId, hrmRecRequisitions.id))
            .where(
                sql`${hrmRecOffers.status} = 'ACCEPTED' AND ${hrmRecOffers.tenantId} = ${tenantId}`
            );

        let totalDays = 0;
        hiredOffers.forEach(h => {
            const start = h.reqDate ? new Date(h.reqDate).getTime() : Date.now();
            const end = h.offerDate ? new Date(h.offerDate).getTime() : Date.now();
            totalDays += (end - start) / (1000 * 60 * 60 * 24);
        });
        const timeToFill = hiredOffers.length > 0 ? Math.round(totalDays / hiredOffers.length) : 0;

        // 4. Source Breakdown
        const candidates = await db.select({ source: hrmRecCandidates.source }).from(hrmRecCandidates)
            .where(eq(hrmRecCandidates.tenantId, tenantId));

        const sources: Record<string, number> = {};
        candidates.forEach(c => {
            const s = c.source || "Direct";
            sources[s] = (sources[s] || 0) + 1;
        });

        return {
            funnel,
            acceptanceRate,
            timeToFill,
            sourceBreakdown: sources,
            totalHires: hiredOffers.length
        };
    }

    // PIPELINE & INTERVIEWS
    static async getPipeline(requisitionId: string, maskPII: boolean = true) {
        // Fetch applications and group by Stage
        const apps = await db.select({
            app: hrmRecApplications,
            candidate: hrmRecCandidates
        })
            .from(hrmRecApplications)
            .innerJoin(hrmRecCandidates, eq(hrmRecApplications.candidateId, hrmRecCandidates.id))
            .where(eq(hrmRecApplications.requisitionId, requisitionId));

        const pipeline: Record<string, any[]> = {
            "NEW": [],
            "SCREENING": [],
            "INTERVIEW": [],
            "OFFER": [],
            "HIRED": [],
            "REJECTED": []
        };

        apps.forEach(row => {
            const stage = row.app.status || "NEW"; // Map status to pipeline column
            if (!pipeline[stage]) pipeline[stage] = [];

            let candidateData = row.candidate;
            if (maskPII) {
                candidateData = { ...row.candidate, email: "******", phone: "******" };
            }

            pipeline[stage].push({ ...row.app, candidate: candidateData });
        });

        return pipeline;
    }

    static async scheduleInterview(data: any) {
        const [interview] = await db.insert(hrmRecInterviews).values(data).returning();

        // Auto-move App to INTERVIEW status if not already
        await db.update(hrmRecApplications)
            .set({ status: 'INTERVIEW', stage: 'Interview Scheduled' })
            .where(eq(hrmRecApplications.id, data.applicationId));

        return interview;
    }

    static async submitInterviewFeedback(id: string, feedback: string, rating: number) {
        const [interview] = await db.update(hrmRecInterviews)
            .set({ feedback, rating, status: "COMPLETED", updatedAt: new Date() })
            .where(eq(hrmRecInterviews.id, id))
            .returning();
        return interview;
    }

    static async getInterviews(applicationId: string) {
        return await db.select().from(hrmRecInterviews).where(eq(hrmRecInterviews.applicationId, applicationId));
    }

    static async getInterviewerSchedule(interviewerId: string) {
        // Retrieve upcoming interviews for a specific interviewer
        const results = await db.select({
            interview: hrmRecInterviews,
            application: hrmRecApplications,
            candidate: hrmRecCandidates,
            requisition: hrmRecRequisitions
        })
            .from(hrmRecInterviews)
            .innerJoin(hrmRecApplications, eq(hrmRecInterviews.applicationId, hrmRecApplications.id))
            .innerJoin(hrmRecCandidates, eq(hrmRecApplications.candidateId, hrmRecCandidates.id))
            .innerJoin(hrmRecRequisitions, eq(hrmRecApplications.requisitionId, hrmRecRequisitions.id))
            .where(eq(hrmRecInterviews.interviewerId, interviewerId))
            .orderBy(desc(hrmRecInterviews.scheduledTime));

        // Format for UI
        return results.map(row => ({
            ...row.interview,
            candidateName: `${row.candidate.firstName} ${row.candidate.lastName}`,
            candidateId: row.candidate.id,
            jobTitle: row.requisition.title,
            requisitionId: row.requisition.id
        }));
    }
}
