import { storage } from "../storage";
import { financeService } from "./finance";
import { apService } from "./ap";
import { arService } from "./ar";
import { AiAction, InsertAiAction, InsertAiAuditLog } from "@shared/schema";
import OpenAI from "openai";
import ExcelJS from "exceljs";

export const openai = new OpenAI({
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1",
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "dummy-key",
});

export class AIService {
    /**
     * @deprecated Legacy functionality. Use Nexus-Tool-Executor and Nexus-AI-Gateway.
     * Only 'processInvoiceExtraction' is retained here.
     */

    async processInvoiceExtraction(file: Buffer, mimeType: string, fileName: string): Promise<any> {
        console.log(`[AI] Extracting invoice from ${fileName} (${mimeType})`);
        let extractedText = "";

        // 1. Convert to text based on type
        if (mimeType.startsWith("audio/")) {
            const transcription = await openai.audio.transcriptions.create({
                file: await OpenAI.toFile(file, fileName),
                model: "whisper-1",
            });
            extractedText = transcription.text;
        } else if (mimeType.includes("excel") || mimeType.includes("spreadsheetml") || fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(file);
            const worksheet = workbook.worksheets[0];
            const rows: any[] = [];
            worksheet.eachRow((row) => {
                rows.push(row.values);
            });
            extractedText = JSON.stringify(rows);
        } else if (mimeType.startsWith("image/") || mimeType === "application/pdf") {
            // For images and PDFs, we use Vision
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert invoice processing agent. Extract the following information from the invoice image/PDF: Supplier Name, Invoice Number, Date, Total Amount, Currency, and Line Items (Description, Quantity, Unit Price, Amount). Return ONLY valid JSON."
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Please extract the invoice details from this file." },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType};base64,${file.toString("base64")}`,
                                },
                            },
                        ],
                    },
                ],
                response_format: { type: "json_object" },
            });
            return JSON.parse(response.choices[0].message.content || "{}");
        }

        // 2. If we have text (from audio or excel), process with GPT-4o
        if (extractedText) {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert invoice processing agent. From the provided text, extract: Supplier Name, Invoice Number, Date, Total Amount, Currency, and Line Items. Return ONLY valid JSON."
                    },
                    {
                        role: "user",
                        content: extractedText
                    }
                ],
                response_format: { type: "json_object" },
            });
            return JSON.parse(response.choices[0].message.content || "{}");
        }

        throw new Error("Unsupported file type or extraction failed");
    }

    // Legacy methods (executeAction, parseIntent, initialize) have been removed 
    // and consolidated into nexus-tool-executor.ts and nexus-ai-gateway.ts
}

export const aiService = new AIService();
