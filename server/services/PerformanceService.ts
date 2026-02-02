import { db } from "../db";
import { hrmPerfGoals, hrmPerfDocuments, hrmPerfFeedback } from "@shared/schema/talent_performance";
import { eq, desc } from "drizzle-orm";

export class PerformanceService {

    // GOALS
    static async getGoals(personId: string) {
        return await db.select().from(hrmPerfGoals)
            .where(eq(hrmPerfGoals.personId, personId))
            .orderBy(desc(hrmPerfGoals.createdAt));
    }

    static async createGoal(data: any) {
        const [goal] = await db.insert(hrmPerfGoals).values(data).returning();
        return goal;
    }

    static async updateGoal(id: string, data: any) {
        const [goal] = await db.update(hrmPerfGoals)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(hrmPerfGoals.id, id))
            .returning();
        return goal;
    }

    static async deleteGoal(id: string) {
        return await db.delete(hrmPerfGoals).where(eq(hrmPerfGoals.id, id)).returning();
    }

    // DOCUMENTS (REVIEWS)
    // DOCUMENTS (REVIEWS)
    static async getReviews(personId?: string) {
        const query = db.select({
            id: hrmPerfDocuments.id,
            status: hrmPerfDocuments.status,
            score: hrmPerfDocuments.overallRating,
            periodName: hrmPerfDocuments.periodName,
            personId: hrmPerfDocuments.personId, // Needed for potential joins/filters
            // We would join with hrPersons here to get names
        }).from(hrmPerfDocuments);

        if (personId) {
            query.where(eq(hrmPerfDocuments.personId, personId));
        }

        const docs = await query;

        // Enrichment (Mocking the name join for V1 parity)
        return docs.map(d => ({
            ...d,
            employeeName: "John Doe", // Placeholder
            score: (d.score || 0) / 5 // Normalize 1-5 to 0-1 for UI percentage if needed, or keep raw
        }));
    }

    static async createReview(data: any) {
        const [review] = await db.insert(hrmPerfDocuments).values(data).returning();
        return review;
    }

    // WORKFLOWS
    static async submitReview(reviewId: string) {
        return await db.update(hrmPerfDocuments)
            .set({ status: "MANAGER_EVAL", employeeSubmittedDate: new Date() })
            .where(eq(hrmPerfDocuments.id, reviewId))
            .returning();
    }

    static async signOffReview(reviewId: string) {
        return await db.update(hrmPerfDocuments)
            .set({ status: "COMPLETED", completedDate: new Date() })
            .where(eq(hrmPerfDocuments.id, reviewId))
            .returning();
    }
}
