
import { db } from "../db";
import { knowledgeArticles } from "../../shared/schema";
import { eq, ilike, or, desc, arrayContains } from "drizzle-orm";

export class KnowledgeBaseService {

    static async createArticle(data: any) {
        const [article] = await db.insert(knowledgeArticles).values({
            ...data,
            tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : [],
            status: "Published" // Auto-publish for simplicity for now
        }).returning();
        return article;
    }

    static async updateArticle(id: string, data: any) {
        // Handle tag splitting if string provided
        const updateData = { ...data };
        if (data.tags && typeof data.tags === 'string') {
            updateData.tags = data.tags.split(',').map((t: string) => t.trim());
        }

        const [article] = await db.update(knowledgeArticles)
            .set({ ...updateData, updatedAt: new Date() })
            .where(eq(knowledgeArticles.id, id))
            .returning();
        return article;
    }

    static async getArticle(id: string) {
        const [article] = await db.select().from(knowledgeArticles).where(eq(knowledgeArticles.id, id));
        return article;
    }

    static async searchArticles(query: string) {
        if (!query) {
            return await db.select().from(knowledgeArticles).orderBy(desc(knowledgeArticles.createdAt));
        }

        const searchTerm = `%${query}%`;
        return await db.select()
            .from(knowledgeArticles)
            .where(
                or(
                    ilike(knowledgeArticles.title, searchTerm),
                    ilike(knowledgeArticles.content, searchTerm),
                    // Note: arrayContains for exact tag match, but ilike is better for general search
                    // For simplicity, we just search title/content for now + category
                    ilike(knowledgeArticles.category, searchTerm)
                )
            )
            .orderBy(desc(knowledgeArticles.createdAt));
    }

    static async getSuggestedArticles(subject: string) {
        // Simple suggestion: split words and find matches for any interesting word
        const words = subject.split(' ').filter(w => w.length > 3);
        if (words.length === 0) return [];

        // Try each word until we find hits
        for (const word of words) {
            const search = `%${word}%`;
            const results = await db.select()
                .from(knowledgeArticles)
                .where(
                    or(
                        ilike(knowledgeArticles.title, search),
                        ilike(knowledgeArticles.content, search)
                    )
                )
                .limit(5);

            if (results.length > 0) return results;
        }

        return [];
    }
}
