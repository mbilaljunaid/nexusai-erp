
import { db } from "../server/db";
import { knowledgeArticles } from "../shared/schema";
import { ilike } from "drizzle-orm";
import { KnowledgeBaseService } from "../server/services/KnowledgeBaseService";

async function verifyKnowledgeBase() {
    console.log("🚀 Starting verification for Knowledge Base (Phase 27)...");

    try {
        // 1. Create Article
        const article = await KnowledgeBaseService.createArticle({
            title: "How to reset password",
            content: "Go to settings and click reset.",
            category: "Technical",
            tags: "password, login"
        });
        console.log(`✅ Created Article: ${article.title}`);

        // 2. Search Article
        const results = await KnowledgeBaseService.searchArticles("reset");
        if (results.length === 0) throw new Error("Search failed");
        console.log(`✅ Search Found ${results.length} articles for 'reset'`);

        // 3. Suggestion
        const suggestions = await KnowledgeBaseService.getSuggestedArticles("I cannot reset my password");
        if (suggestions.length === 0) throw new Error("Suggestion failed");
        console.log(`✅ Suggestion Found ${suggestions.length} articles`);

        // Cleanup
        await db.delete(knowledgeArticles).where(ilike(knowledgeArticles.title, "%reset password%"));

        console.log("✅ Verification Passed");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verifyKnowledgeBase();
