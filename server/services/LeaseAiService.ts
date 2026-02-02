
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
        // Mock delay to simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Basic heuristic regex for demo purposes (robust AI would use LLM)
        const rentMatch = text.match(/\$\s?([0-9,]+(\.[0-9]{2})?)/);
        const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
        const lessorMatch = text.match(/Lessor:\s*(.+)/i) || ["", "TechProp Holdings LLC"];

        return {
            leaseNumber: "AI-" + Math.floor(Math.random() * 10000),
            commencementDate: dateMatch ? dateMatch[0] : new Date().toISOString().split("T")[0],
            expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split("T")[0], // Default 5 years
            monthlyRent: rentMatch ? parseFloat(rentMatch[1].replace(/,/g, "")) : 5000,
            lessorName: lessorMatch[1].trim(),
            confidence: 0.89
        };
    }
}

export const leaseAiService = new LeaseAiService();
