import { db } from "../db";
import { eq, inArray, desc, sql } from "drizzle-orm";
import { hrmLearningCourses, hrmLearningEnrollments, hrmLearningOfferings } from "@shared/schema/talent_learning";
import { hrmSkills } from "@shared/schema/talent_core";
import { executeTool } from "./nexus-tool-executor";
import { callAIJson, getCapabilityPrompt } from "./nexus-ai-gateway";

// Hybrid AI Service: Rule-based Fallback + LLM Hooks
export class LearningAI {

    // 1. SKILL EXTRACTION
    // Extracts skills from text using Dictionary Matching (Heuristic)
    // In strict enterprise mode, this avoids sending PII/Data to external LLMs unless configured.
    static async extractSkills(text: string): Promise<string[]> {
        if (!text) return [];

        try {
            const systemPrompt = await getCapabilityPrompt("Learning Assistant",
                "You are an expert Learning & Development assistant. Extract professional skills from the text. Return a JSON object with a 'skills' array of strings.");

            const response = await callAIJson<{ skills: string[] }>([
                { role: "user", content: `Extract skills from: "${text}"` }
            ], {
                systemPrompt,
                temperature: 0.1
            });

            return response.skills || [];
        } catch (error) {
            console.error("LearningAI Skill Extraction Failed:", error);
            // Fallback to dictionary matching
            const allSkills = await db.select().from(hrmSkills);
            const extracted: string[] = [];
            const normalizedText = text.toLowerCase();
            for (const skill of allSkills) {
                if (normalizedText.includes(skill.name.toLowerCase())) extracted.push(skill.name);
            }
            return extracted;
        }
    }

    // 2. RECOMMENDATION ENGINE
    // Content-Based Filtering: Matches User's past course categories to new courses.
    static async getRecommendations(personId: string, tenantId: string) {
        // A. Get User's Learning History
        const history = await db.select({
            category: hrmLearningCourses.category,
            provider: hrmLearningCourses.provider
        })
            .from(hrmLearningEnrollments)
            .innerJoin(hrmLearningOfferings, eq(hrmLearningEnrollments.offeringId, hrmLearningOfferings.id))
            .innerJoin(hrmLearningCourses, eq(hrmLearningOfferings.courseId, hrmLearningCourses.id))
            .where(eq(hrmLearningEnrollments.personId, personId));

        // B. Calculate Preferences
        const categoryCounts: Record<string, number> = {};
        history.forEach(h => {
            if (h.category) categoryCounts[h.category] = (categoryCounts[h.category] || 0) + 1;
        });

        const preferredCategories = Object.entries(categoryCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([cat]) => cat);

        // C. Fetch Recommendations
        // 1. Top picks in preferred categories
        // 2. "Trending" (Newest)

        let recommendations = [];

        if (preferredCategories.length > 0) {
            recommendations = await db.select().from(hrmLearningCourses)
                .where(inArray(hrmLearningCourses.category, preferredCategories.slice(0, 3)))
                .limit(5);
        }

        // If not enough, fill with Trending (Newest)
        if (recommendations.length < 5) {
            const trending = await db.select().from(hrmLearningCourses)
                .orderBy(desc(hrmLearningCourses.createdAt))
                .limit(5 - recommendations.length);

            recommendations = [...recommendations, ...trending];
        }

        // Deduplicate
        const uniqueRecs = Array.from(new Set(recommendations.map(r => r.id)))
            .map(id => recommendations.find(r => r.id === id));

        return uniqueRecs;
    }
}
