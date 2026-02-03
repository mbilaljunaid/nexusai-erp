export interface OCRResult {
    merchant: string;
    date: Date;
    amount: number;
    currency: string;
    taxAmount?: number;
    confidence: number; // 0.0 to 1.0
    isManualReviewRequired: boolean;
}

export class OCRService {
    private static readonly CONFIDENCE_THRESHOLD = 0.85;

    /**
     * Simulates high-fidelity OCR extraction from a receipt image/PDF.
     * In a real Tier-1 system, this would call AWS Textract, Tesseract, or a specialized OCR API.
     */
    async extractReceiptData(receiptBuffer: Buffer | string): Promise<OCRResult> {
        console.log("[OCR] Parsing receipt data...");

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // High-fidelity mock extraction
        const mockResult: OCRResult = {
            merchant: "Starbucks Coffee",
            date: new Date(),
            amount: 15.75,
            currency: "USD",
            taxAmount: 1.25,
            confidence: 0.92,
            isManualReviewRequired: false
        };

        if (mockResult.confidence < OCRService.CONFIDENCE_THRESHOLD) {
            mockResult.isManualReviewRequired = true;
        }

        console.log(`[OCR] Extracted: ${mockResult.merchant} - $${mockResult.amount} (${Math.round(mockResult.confidence * 100)}% confidence)`);
        return mockResult;
    }
}

export const ocrService = new OCRService();
