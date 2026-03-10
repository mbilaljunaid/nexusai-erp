
import { db } from "../db";
import { glJournals, glJournalLines, glAccounts } from "@shared/schema/finance";
import { hrmLearningEnrollments, hrmLearningOfferings, hrmLearningCourses } from "@shared/schema/talent_learning";
import { eq, and } from "drizzle-orm";

export class LearningFinancialBridge {

    /**
     * Interfaces a paid enrollment to the General Ledger.
     * In a real ERP, this would be an SLA (Subledger Accounting) event.
     */
    static async interfaceToGL(tenantId: string, enrollmentId: string) {
        // 1. Fetch Enrollment Details
        const data = await db.select({
            enrollment: hrmLearningEnrollments,
            offering: hrmLearningOfferings,
            course: hrmLearningCourses
        })
            .from(hrmLearningEnrollments)
            .innerJoin(hrmLearningOfferings, eq(hrmLearningEnrollments.offeringId, hrmLearningOfferings.id))
            .innerJoin(hrmLearningCourses, eq(hrmLearningOfferings.courseId, hrmLearningCourses.id))
            .where(eq(hrmLearningEnrollments.id, enrollmentId));

        if (!data.length) throw new Error("Enrollment not found");
        const { offering, course } = data[0];

        const price = Number(offering.price || 0);
        if (price <= 0) return { skipped: true, reason: "Zero cost course" };

        // 2. Create Journal Header
        const journalNumber = `LRN-${Date.now()}`;
        const [journal] = await db.insert(glJournals).values({
            journalNumber,
            ledgerId: "PRIMARY",
            source: "LEARNING",
            description: `Learning Fee: ${course.title} (Offering: ${offering.title})`,
            currencyCode: offering.currency || "USD",
            status: "Draft"
        }).returning();

        // 3. Create Lines (Simple: Expense vs Liability/Cash)
        // Assume account codes for now or look them up
        const [expenseAccount] = await db.select().from(glAccounts).where(eq(glAccounts.accountType, "Expense")).limit(1);
        const [liabilityAccount] = await db.select().from(glAccounts).where(eq(glAccounts.accountType, "Liability")).limit(1);

        if (expenseAccount && liabilityAccount) {
            await db.insert(glJournalLines).values([
                {
                    journalId: journal.id,
                    accountId: expenseAccount.id,
                    enteredDebit: price.toString(),
                    description: `Debit: Learning Expense`
                } as any,
                {
                    journalId: journal.id,
                    accountId: liabilityAccount.id,
                    enteredCredit: price.toString(),
                    description: `Credit: Training Accrual`
                } as any
            ]);
        }

        return { journalId: journal.id, journalNumber };
    }
}
