import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

export interface UATScript {
  id: string;
  testName: string;
  steps: string[];
  expectedResults: string[];
  industrySpecific: boolean;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
}

@Injectable()
export class UATService {
  private openai: OpenAI;
  private scripts: UATScript[] = [];
  private scriptCounter = 1;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateScripts(industryId: string, moduleId: string, numberOfScripts: number = 5): Promise<UATScript[]> {
    const prompt = `Generate ${numberOfScripts} comprehensive UAT test scripts for the ${moduleId} module in the ${industryId} industry.
    For each script include:
    - Clear test name
    - Step-by-step instructions
    - Expected results
    - Industry-specific scenarios
    - Estimated time in minutes
    
    Return as JSON array of test scripts with structure: [{ testName, steps: [], expectedResults: [], estimatedTime }]`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 3000,
      });

      const content = response.choices[0]?.message?.content || '[]';
      const parsedScripts = JSON.parse(content);

      const scripts: UATScript[] = parsedScripts.map((script: any, index: number) => ({
        id: `uat-${this.scriptCounter++}`,
        testName: script.testName,
        steps: script.steps || [],
        expectedResults: script.expectedResults || [],
        industrySpecific: true,
        priority: index < 2 ? 'high' : index < 4 ? 'medium' : 'low',
        estimatedTime: script.estimatedTime || 30,
      }));

      this.scripts.push(...scripts);
      return scripts;
    } catch (error) {
      return [];
    }
  }

  getScripts(industryId?: string): UATScript[] {
    return this.scripts;
  }

  getScript(id: string): UATScript | undefined {
    return this.scripts.find(s => s.id === id);
  }

  updateScriptStatus(id: string, status: string): UATScript | undefined {
    const script = this.scripts.find(s => s.id === id);
    if (script) {
      // Track status in a separate map if needed
    }
    return script;
  }

  generateCoverageReport(industryId: string): { coverage: number; gaps: string[]; recommendations: string[] } {
    const criticalAreas = this.getCriticalAreasForIndustry(industryId);
    const coverage = (this.scripts.length / (criticalAreas.length * 2)) * 100;

    const gaps = criticalAreas
      .slice(this.scripts.length / criticalAreas.length)
      .map(area => `Test coverage needed for ${area}`);

    const recommendations = [
      'Increase test coverage for critical business processes',
      'Add edge case testing for industry-specific requirements',
      'Implement regression testing for integrations',
    ];

    return { coverage: Math.min(coverage, 100), gaps, recommendations };
  }

  private getCriticalAreasForIndustry(industryId: string): string[] {
    const criticalAreas: Record<string, string[]> = {
      manufacturing: ['Production Planning', 'Quality Control', 'Maintenance', 'Inventory'],
      retail: ['POS', 'Inventory', 'Customer', 'Payments'],
      finance: ['GL Posting', 'Reconciliation', 'Compliance', 'Audit Trail'],
      healthcare: ['Patient Privacy', 'Billing', 'Compliance', 'Clinical Data'],
      construction: ['Project Costing', 'Resource Allocation', 'Compliance', 'Invoicing'],
    };

    return criticalAreas[industryId] || ['General Functionality', 'Integration', 'Performance', 'Security'];
  }
}
