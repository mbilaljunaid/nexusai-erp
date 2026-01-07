import { Injectable, Logger } from '@nestjs/common';
import { AIIntent, AIIntentSchema } from '@contracts/ai/schema';
import OpenAI from 'openai';

@Injectable()
export class IntentService {
    private readonly logger = new Logger(IntentService.name);
    private openai: OpenAI;

    constructor() {
        // Stub or Init OpenAI
        const apiKey = process.env.OPENAI_API_KEY || 'dummy-key';
        this.openai = new OpenAI({ apiKey });
    }

    async parseIntent(input: string): Promise<AIIntent> {
        this.logger.log(`Parsing intent for input: "${input}"`);

        // MOCK IMPLEMENTATION FOR DEV
        // In a real scenario, this would call GPT-4o with a system prompt.

        if (input.toLowerCase().includes('eta') || input.toLowerCase().includes('delay')) {
            return {
                originalInput: input,
                confidence: 0.95,
                intentType: 'LOGISTICS.PREDICT_ETA_DELAY',
                entities: {
                    shipmentId: 'SHIP-123', // Mock ID extraction
                },
                reasoning: 'User asked about delay/ETA.',
            };
        }

        if (input.toLowerCase().includes('budget')) {
            return {
                originalInput: input,
                confidence: 0.88,
                intentType: 'FINANCE.CREATE_BUDGET',
                entities: {
                    amount: 50000,
                    department: 'Marketing'
                },
                reasoning: 'Keyword match on budget.'
            }
        }

        // Default Fallback
        return {
            originalInput: input,
            confidence: 0.1,
            intentType: 'UNKNOWN',
            entities: {},
            reasoning: 'No intent matched.',
        };
    }
}
