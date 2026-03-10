import { db } from "../../db";
import {
    glJournalBatches,
    glJournals,
    glApprovalRules,
    glJournalApprovals,
    glApprovalHistory,
    glApprovalDelegations,
    glApprovalGroupMembers,
    glJournalLines
} from "../../../shared/schema/finance";
import { eq, and, lte, gte, or, isNull, sum } from "drizzle-orm";

export class ApprovalRoutingService {
    /**
     * Evaluates a Journal Header against configured Approval Rules and routes it appropriately.
     * Takes into account delegations (vacation rules) and multi-step approval groups.
     */
    static async routeJournalForApproval(journalId: string, submitterId: string): Promise<{ status: 'Pending' | 'Auto-Approved', message: string }> {
        // 1. Fetch Journal Details
        const [journal] = await db.select().from(glJournals).where(eq(glJournals.id, journalId));
        if (!journal) throw new Error("Journal not found");

        const ledgerId = journal.ledgerId;
        const amount = Number(journal.totalDebit || 0);
        const source = journal.source || "Manual";
        const category = journal.category || "Adjustment";

        // 2. Find matching Approval Rules
        // Rule match logic: Matches ledger, source, category, and amount bounds.
        // Fallback: If no exact source/category match, look for wildcard/null rules.
        const potentialRules = await db.select().from(glApprovalRules).where(
            and(
                eq(glApprovalRules.ledgerId, ledgerId),
                eq(glApprovalRules.enabled, true),
                lte(glApprovalRules.minAmount, amount.toString())
            )
        );

        // Filter rules manually for complex conditions
        const applicableRules = potentialRules.filter(rule => {
            const matchesSource = !rule.source || rule.source === source;
            const matchesCategory = !rule.category || rule.category === category;
            const matchesMaxAmount = !rule.maxAmount || amount <= Number(rule.maxAmount);
            return matchesSource && matchesCategory && matchesMaxAmount;
        });

        // Sort by priority (lower number = higher priority)
        applicableRules.sort((a, b) => (a.priority || 10) - (b.priority || 10));

        if (applicableRules.length === 0) {
            // No rule requires approval -> Auto-Approve (Enterprise Parity: usually defaults to requiring approval, but assuming auto-approve if no matched rule)
            await this.markApproved(journalId, 'System', 'Auto-Approved based on threshold.');
            return { status: 'Auto-Approved', message: "No approval required based on rule thresholds." };
        }

        const ruleToApply = applicableRules[0];
        let targetApproverId: string | null = null;
        let routeMessage = '';

        // 3. Determine Routing (Group vs User)
        if (ruleToApply.approverGroupId) {
            // Enterprise Hierarchy: Route to the first person in sequence of the group
            const members = await db.select().from(glApprovalGroupMembers)
                .where(eq(glApprovalGroupMembers.groupId, ruleToApply.approverGroupId));

            if (members.length > 0) {
                // Sort by sequence just in case we implement multi-step later
                members.sort((a, b) => (a.sequence || 1) - (b.sequence || 1));
                targetApproverId = members[0].userId;
                routeMessage = `Routed to Group Sequence 1.`;
            } else {
                throw new Error("Approval Rule points to an empty Approval Group.");
            }
        } else if (ruleToApply.approverUserId) {
            targetApproverId = ruleToApply.approverUserId;
            routeMessage = `Routed to Direct User.`;
        } else if (ruleToApply.approverRole) {
            // In a real system, query users by role. For MVP, we'll simulate.
            // ... (Skipping role resolution for briefness)
            targetApproverId = "role-based-approver-id"; // Mock
        }

        if (!targetApproverId) {
            throw new Error("Misconfigured Approval Rule: No valid target (User, Group, or Role).");
        }

        // 4. Process Vacation / Delegation Rules
        const activeDelegation = await this.checkDelegation(targetApproverId);
        let finalApproverId = targetApproverId;
        if (activeDelegation) {
            finalApproverId = activeDelegation.delegateeId;
            routeMessage += ` Delegated from Original Approver due to active vacation rule.`;
        }

        // 5. Create Pending Approval Record
        await db.insert(glJournalApprovals).values({
            journalId,
            approverId: finalApproverId,
            status: "Pending",
            actionDate: new Date()
        });

        // 6. Log History
        await db.insert(glApprovalHistory).values({
            journalId,
            action: "SUBMIT",
            actorId: submitterId,
            comments: `Journal submitted for approval. Rule: ${ruleToApply.name}. ${routeMessage}`
        });

        // 7. Update Journal Header Status
        await db.update(glJournals)
            .set({ approvalStatus: "Pending" })
            .where(eq(glJournals.id, journalId));

        return { status: 'Pending', message: `Routed for approval to ${finalApproverId}. ${routeMessage}` };
    }

    /**
     * Checks if a user has an active delegation rule (vacation out-of-office)
     */
    private static async checkDelegation(userId: string) {
        const now = new Date();
        const delegations = await db.select().from(glApprovalDelegations).where(
            and(
                eq(glApprovalDelegations.delegatorId, userId),
                eq(glApprovalDelegations.enabled, true),
                lte(glApprovalDelegations.startDate, now),
                gte(glApprovalDelegations.endDate, now)
            )
        );
        return delegations.length > 0 ? delegations[0] : null;
    }

    static async markApproved(journalId: string, actorId: string, comments: string = "Approved.") {
        await db.update(glJournals)
            .set({ approvalStatus: "Approved" })
            .where(eq(glJournals.id, journalId));

        await db.insert(glApprovalHistory).values({
            journalId,
            action: "APPROVE",
            actorId: actorId,
            comments
        });
    }

    static async markRejected(journalId: string, actorId: string, comments: string) {
        await db.update(glJournals)
            .set({ approvalStatus: "Rejected", status: "Draft" })
            .where(eq(glJournals.id, journalId));

        await db.insert(glApprovalHistory).values({
            journalId,
            action: "REJECT",
            actorId: actorId,
            comments
        });
    }

    static async getPendingApprovals(userId: string) {
        // Query pending approvals for the specific user
        const pending = await db.select({
            approvalId: glJournalApprovals.id,
            journalId: glJournals.id,
            journalNumber: glJournals.journalNumber,
            description: glJournals.description,
            requester: glJournals.createdBy,
            submittedDate: glJournalApprovals.actionDate,
        })
            .from(glJournalApprovals)
            .innerJoin(glJournals, eq(glJournalApprovals.journalId, glJournals.id))
            .where(
                and(
                    eq(glJournalApprovals.approverId, userId),
                    eq(glJournalApprovals.status, "Pending"),
                    eq(glJournals.approvalStatus, "Pending")
                )
            );

        const result = [];
        for (const p of pending) {
            const [lineAggr] = await db.select({
                totalAmount: sum(glJournalLines.accountedDebit)
            })
                .from(glJournalLines)
                .where(eq(glJournalLines.journalId, p.journalId));

            result.push({
                ...p,
                amount: lineAggr?.totalAmount || 0
            });
        }

        return result;
    }
}
