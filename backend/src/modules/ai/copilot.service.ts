import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

interface CopilotContext {
  industryId: string;
  moduleId: string;
  tenantId: string;
  userRole: string;
  currentData?: any;
}

interface CopilotResponse {
  suggestion: string;
  action: string;
  confidence: number;
  nextSteps: string[];
}

@Injectable()
export class CopilotService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getIndustryInsight(context: CopilotContext, question: string): Promise<CopilotResponse> {
    const systemPrompt = `You are an AI assistant for ${context.industryId} industry in the ${context.moduleId} module.
    User role: ${context.userRole}
    Tenant: ${context.tenantId}
    
    Provide actionable insights, process optimizations, and compliance recommendations specific to this context.
    Always include next steps and confidence levels.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content || '';
      return {
        suggestion: content,
        action: this.extractAction(content),
        confidence: 0.85,
        nextSteps: this.extractNextSteps(content),
      };
    } catch (error) {
      return {
        suggestion: 'Unable to process AI suggestion at this time',
        action: 'contact_support',
        confidence: 0,
        nextSteps: ['Contact support team'],
      };
    }
  }

  async autoGenerateConfiguration(industryId: string, moduleId: string): Promise<any> {
    const prompt = `Generate a comprehensive default configuration for ${moduleId} module in ${industryId} industry.
    Include field mappings, validation rules, and workflow automations.
    Return as JSON.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content || '{}';
      try {
        return JSON.parse(content);
      } catch {
        return { success: false, message: content };
      }
    } catch (error) {
      return { success: false, message: 'Configuration generation failed' };
    }
  }

  async detectAnomalies(data: any[], context: CopilotContext): Promise<any[]> {
    const prompt = `Analyze this data for anomalies in the context of ${context.industryId} industry:
    ${JSON.stringify(data.slice(0, 5))}
    
    Return JSON array of anomalies with severity and recommendations.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content || '[]';
      try {
        return JSON.parse(content);
      } catch {
        return [];
      }
    } catch (error) {
      return [];
    }
  }

  async generateUATScripts(industryId: string, moduleId: string): Promise<string[]> {
    const prompt = `Generate 5 comprehensive UAT test scripts for ${moduleId} module in ${industryId} industry.
    Include test steps, expected results, and industry-specific scenarios.
    Return as JSON array of test scripts.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content || '[]';
      try {
        return JSON.parse(content);
      } catch {
        return ['Failed to generate UAT scripts'];
      }
    } catch (error) {
      return ['Error generating UAT scripts'];
    }
  }

  private extractAction(content: string): string {
    if (content.toLowerCase().includes('automat')) return 'automate';
    if (content.toLowerCase().includes('alert')) return 'alert';
    if (content.toLowerCase().includes('optimi')) return 'optimize';
    if (content.toLowerCase().includes('review')) return 'review';
    return 'inform';
  }

  private extractNextSteps(content: string): string[] {
    const lines = content.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('•'));
    return lines.slice(0, 3).map(l => l.replace(/^[-•]\s*/, '').trim());
  }
}
