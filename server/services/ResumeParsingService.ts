
import { db } from "../db";
import { eq } from "drizzle-orm";
import { hrmRecCandidates, hrmRecRequisitions, hrmRecApplications } from "../../shared/schema/talent_recruitment";

// Mock AI Service until integration with OpenAI/Textract
export class ResumeParsingService {

    // Simulates extracting data from a file (PDF/Doc)
    // For V1, we assume 'fileContent' is passed as raw text or we infer from a dummy file path
    static async parseResume(fileContent: string): Promise<any> {
        // Mock extraction logic based on keywords
        const skillsOfInterest = ["React", "TypeScript", "Node.js", "Python", "SQL", "Project Management", "Sales", "Accounting"];
        const foundSkills = skillsOfInterest.filter(skill => fileContent.toLowerCase().includes(skill.toLowerCase()));

        // Mock Education extraction
        const education = fileContent.toLowerCase().includes("bachelor") ? "Bachelor's Degree" :
            fileContent.toLowerCase().includes("master") ? "Master's Degree" : "High School";

        return {
            skills: foundSkills,
            education: education,
            summary: "AI-generated summary: Candidate has experience in " + foundSkills.join(", ")
        };
    }

    // Scores a candidate against a specific Job Requisition
    static async scoreCandidate(candidateId: string, requisitionId: string): Promise<number> {
        // 1. Fetch Candidate & Job
        const [candidate] = await db.select().from(hrmRecCandidates).where(eq(hrmRecCandidates.id, candidateId));
        const [job] = await db.select().from(hrmRecRequisitions).where(eq(hrmRecRequisitions.id, requisitionId));

        if (!candidate || !job) return 0;

        // 2. Normalize Skills
        const candidateSkills = (candidate.skills || []).map((s: string) => s.toLowerCase());
        // For V1, we assume Job Description contains the required skills as text
        // In a real app, we'd have a 'requiredSkills' array column
        const jobDescription = (job.description || "").toLowerCase() + " " + (job.title || "").toLowerCase();

        // 3. Calculate Overlap
        // We'll look for common tech keywords in the Job Description
        const keywords = ["react", "typescript", "node", "sql", "python", "java", "marketing", "sales", "finance"];
        const requiredKeywords = keywords.filter(k => jobDescription.includes(k));

        if (requiredKeywords.length === 0) return 50; // Neutral score if no keywords found

        const matchCount = requiredKeywords.filter(k => candidateSkills.some(cs => cs.includes(k))).length;

        let score = Math.round((matchCount / requiredKeywords.length) * 100);

        // Boost for similar title words? (Optional)

        // Update Application with Score
        const [app] = await db.select().from(hrmRecApplications)
            .where(eq(hrmRecApplications.candidateId, candidateId)); // Assuming 1 active app per pair, but technically checking link

        // Determine correct Application ID (We assume the caller might want to update it)
        // For this method, we just return the score, but we can also update DB.

        return score;
    }
}
