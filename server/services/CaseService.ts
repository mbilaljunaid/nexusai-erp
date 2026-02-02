
import { db } from "../db";
import { cases, caseComments, accounts, contacts } from "../../shared/schema";
import { eq, desc, and } from "drizzle-orm";

export class CaseService {

    static async createCase(data: any, userId?: string) {
        const [newCase] = await db.insert(cases).values({
            ...data,
            userId,
            status: "New",
            priority: data.priority || "Medium"
        }).returning();
        return newCase;
    }

    static async updateCase(id: string, updates: any) {
        const [updated] = await db.update(cases)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(cases.id, id))
            .returning();
        return updated;
    }

    static async getCaseDetails(id: string) {
        const [c] = await db.select().from(cases).where(eq(cases.id, id));
        if (!c) throw new Error("Case not found");

        const comments = await db.select()
            .from(caseComments)
            .where(eq(caseComments.caseId, id))
            .orderBy(desc(caseComments.createdAt));

        let account = null;
        if (c.accountId) {
            [account] = await db.select().from(accounts).where(eq(accounts.id, c.accountId));
        }

        let contact = null;
        if (c.contactId) {
            [contact] = await db.select().from(contacts).where(eq(contacts.id, c.contactId));
        }

        return {
            case: c,
            comments,
            account,
            contact
        };
    }

    static async addComment(caseId: string, body: string, userId: string, isPublic: boolean = false) {
        const [comment] = await db.insert(caseComments).values({
            caseId,
            body,
            createdById: userId,
            isPublic
        }).returning();
        return comment;
    }
}
