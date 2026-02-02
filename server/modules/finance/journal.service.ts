import { db } from "../../db";
import {
    glJournals, glJournalLines, glApprovalRules, glJournalApprovals,
    glApprovalHistory,
    glPeriods
} from "@shared/schema";
import { eq, and, gte, lt, desc, sql } from "drizzle-orm";
import { closeEngine } from "../../services/period-close/CloseEngine";

export class JournalService {

    /**
     * Submit Journal for Approval
     * Checks amount against rules to determine if approval is needed.
     */
    async submitJournal(journalId: string, userId: string): Promise<any> {
        // 1. Get Journal & Amount
        const [journal] = await db.select().from(glJournals).where(eq(glJournals.id, journalId));
        if (!journal) throw new Error("Journal not found");

        if (journal.status === "Posted") throw new Error("Journal is already posted");

        // Calculate Total Debits (absolute value)
        const lines = await db.select().from(glJournalLines).where(eq(glJournalLines.journalId, journalId));
        const totalAmount = lines.reduce((sum, line) => sum + Number(line.enteredDebit || 0), 0);

        // 2. Check Period Status (Prevent submission in closed periods)
        // We need periodName from periodId
        if (journal.periodId) {
            const [period] = await db.select().from(glPeriods).where(eq(glPeriods.id, journal.periodId));
            if (period) {
                const isOpen = await closeEngine.isPeriodOpen(journal.ledgerId, "GL", new Date());
                // Note: isPeriodOpen check typically uses glDate, here we act as if 'now' is the action date
                // Strictly we should check if journal.periodId is Open.
                if (period.status !== 'Open') {
                    throw new Error(`Period ${period.periodName} is not Open.`);
                }
            }
        }

        // 3. Find Matching Approval Rule
        // Logic: Find highest priority rule where amount > minAmount
        const rules = await db.select().from(glApprovalRules)
            .where(and(
                eq(glApprovalRules.ledgerId, journal.ledgerId),
                eq(glApprovalRules.enabled, true)
            ))
            .orderBy(desc(glApprovalRules.minAmount)); // Highest amount first

        let requiredRule = null;
        for (const rule of rules) {
            if (totalAmount >= Number(rule.minAmount)) {
                if (!rule.maxAmount || totalAmount <= Number(rule.maxAmount)) {
                    requiredRule = rule;
                    break;
                }
            }
        }

        let newStatus = "Not Required";

        if (requiredRule) {
            newStatus = "Pending";

            // Create Approval Request
            await db.insert(glJournalApprovals).values({
                journalId,
                approverId: requiredRule.approverUserId, // Specific User
                status: "Pending",
                comments: `Requires approval from ${requiredRule.approverRole} (Rule: ${requiredRule.ruleName})`
            });
        }

        // 4. Update Journal Status
        await db.update(glJournals)
            .set({ approvalStatus: newStatus })
            .where(eq(glJournals.id, journalId));

        // 5. Log History
        await db.insert(glApprovalHistory).values({
            journalId,
            action: "SUBMIT",
            actorId: userId,
            comments: `Submitted for approval. Amount: ${totalAmount}. Status: ${newStatus}`
        });

        return { status: newStatus, message: requiredRule ? "Submitted for Approval" : "Auto-Approved (No Rules Hit)" };
    }

    /**
     * Approve Journal
     */
    async approveJournal(journalId: string, approverId: string, comments?: string): Promise<any> {
        const [approval] = await db.select().from(glJournalApprovals)
            .where(and(
                eq(glJournalApprovals.journalId, journalId),
                eq(glJournalApprovals.status, "Pending")
            ));

        if (!approval) throw new Error("No pending approval found for this journal");

        // 1. Update Approval Record
        await db.update(glJournalApprovals)
            .set({
                status: "Approved",
                actionDate: new Date(),
                comments: comments
            })
            .where(eq(glJournalApprovals.id, approval.id));

        // 2. Update Journal Header
        await db.update(glJournals)
            .set({ approvalStatus: "Approved" })
            .where(eq(glJournals.id, journalId));

        // 3. Log History
        await db.insert(glApprovalHistory).values({
            journalId,
            action: "APPROVE",
            actorId: approverId,
            comments: comments || "Approved by approver"
        });

        return { success: true, status: "Approved" };
    }

    /**
     * Reject Journal
     */
    async rejectJournal(journalId: string, approverId: string, comments: string): Promise<any> {
        if (!comments) throw new Error("Rejection comments are required");

        const [approval] = await db.select().from(glJournalApprovals)
            .where(and(
                eq(glJournalApprovals.journalId, journalId),
                eq(glJournalApprovals.status, "Pending")
            ));

        if (!approval) throw new Error("No pending approval found");

        // 1. Update Approval Record
        await db.update(glJournalApprovals)
            .set({
                status: "Rejected",
                actionDate: new Date(),
                comments: comments
            })
            .where(eq(glJournalApprovals.id, approval.id));

        // 2. Update Journal Header
        await db.update(glJournals)
            .set({ approvalStatus: "Rejected" })
            .where(eq(glJournals.id, journalId));

        // 3. Log History
        await db.insert(glApprovalHistory).values({
            journalId,
            action: "REJECT",
            actorId: approverId,
            comments
        });

        return { success: true, status: "Rejected" };
    }

    /**
     * Get Pending Approvals for User
     */
    async getPendingApprovals(userId: string) {
        // In a real app, match approverId = userId. 
        // For MVP/Demo, we might return all pending if userId is admin/controller
        // or strictly filter. Let's filter by approverUserId in the rule snapshot.

        // Join Approvals with Journal Header
        const approvals = await db.select({
            approvalId: glJournalApprovals.id,
            journalId: glJournals.id,
            journalNumber: glJournals.journalNumber,
            description: glJournals.description,
            amount: sql<number>`(SELECT SUM(entered_debit) FROM gl_journal_lines_v2 WHERE journal_id = ${glJournals.id})`,
            submittedDate: glJournalApprovals.createdAt,
            requester: glJournals.createdBy
        })
            .from(glJournalApprovals)
            .innerJoin(glJournals, eq(glJournalApprovals.journalId, glJournals.id))
            .where(eq(glJournalApprovals.status, "Pending"));
        // .where(eq(glJournalApprovals.approverId, userId)); // Uncommon in MVP as roles are mocked.

        return approvals;
    }
    /**
     * Get Audit Logs for Journal
     */
    async getAuditLogs(journalId: string) {
        // Return structured history from glApprovalHistory
        // In a real app we would join with User table for names
        return await db.select({
            id: glApprovalHistory.id,
            action: glApprovalHistory.action,
            actor: glApprovalHistory.actorId,
            timestamp: glApprovalHistory.actionDate,
            details: glApprovalHistory.comments
        })
            .from(glApprovalHistory)
            .where(eq(glApprovalHistory.journalId, journalId))
            .orderBy(desc(glApprovalHistory.actionDate));
    }
}

export const journalService = new JournalService();
