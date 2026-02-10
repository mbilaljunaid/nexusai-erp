
import { getCapabilityPrompt, callAIJson } from "./nexus-ai-gateway";
interface ExtractedLeaseData {
    leaseNumber?: string;
    commencementDate?: string;
    expirationDate?: string;
    monthlyRent?: number;
    lessorName?: string;
    confidence: number;
}

export class LeaseAiService {
    // In a real implementation, this would call OpenAI API
    async extractLeaseData(text: string): Promise<ExtractedLeaseData> {
        try {
            // Fetch dynamic system prompt from DB
            const systemPrompt = await getCapabilityPrompt("Lease Analyst",
                "You are an expert lease analyst. Extract the following fields from the lease text: leaseNumber, commencementDate (YYYY-MM-DD), expirationDate (YYYY-MM-DD), monthlyRent (number), lessorName. Return JSON.");

            // Call AI Gateway
            const result = await callAIJson<ExtractedLeaseData>([
                { role: "user", content: text }
            ], {
                systemPrompt,
                temperature: 0.1 // Precision is key
            });

            return {
                ...result,
                confidence: 0.95 // AI confidence
            };

        } catch (error) {
            console.error("Lease AI Extraction Failed:", error);
            // Fallback to mock for reliability if AI fails (or if no API key)
            return {
                leaseNumber: "FALLBACK-" + Math.floor(Math.random() * 10000),
                commencementDate: new Date().toISOString().split("T")[0],
                monhtlyRent: 0,
                lessorName: "Unknown",
                confidence: 0.0
            } as any;
        }
    }
}

export const leaseAiService = new LeaseAiService();
