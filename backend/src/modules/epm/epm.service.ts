import { Injectable } from '@nestjs/common';

export interface BudgetLine {
  id: string;
  accountId: string;
  departmentId: string;
  amount: number;
  period: string;
}

export interface Forecast {
  id: string;
  period: string;
  revenue: number;
  expenses: number;
  variance: number;
  probability: number;
}

export interface ScenarioModel {
  id: string;
  name: string;
  type: 'best_case' | 'worst_case' | 'base_case' | 'custom';
  assumptions: Record<string, any>;
  projectedRevenue: number;
  projectedExpenses: number;
  projectedProfit: number;
}

@Injectable()
export class EPMService {
  private budgets: Map<string, BudgetLine[]> = new Map();
  private forecasts: Forecast[] = [];
  private scenarios: ScenarioModel[] = [];

  createBudget(period: string, lines: BudgetLine[]): { period: string; totalAmount: number } {
    this.budgets.set(period, lines);
    const total = lines.reduce((sum, line) => sum + line.amount, 0);
    return { period, totalAmount: total };
  }

  getBudget(period: string): BudgetLine[] | undefined {
    return this.budgets.get(period);
  }

  createForecast(period: string, revenue: number, expenses: number): Forecast {
    const forecast: Forecast = {
      id: `FC-${Date.now()}`,
      period,
      revenue,
      expenses,
      variance: revenue - expenses,
      probability: Math.random() * 0.3 + 0.7, // 70-100% confidence
    };
    this.forecasts.push(forecast);
    return forecast;
  }

  getForecastTrend(periods: number): Forecast[] {
    return this.forecasts.slice(-periods);
  }

  predictVariance(budgetPeriod: string): { expectedVariance: number; riskLevel: 'low' | 'medium' | 'high' } {
    const budget = this.budgets.get(budgetPeriod);
    if (!budget) return { expectedVariance: 0, riskLevel: 'low' };

    const totalBudgeted = budget.reduce((sum, line) => sum + line.amount, 0);
    const variance = totalBudgeted * (Math.random() * 0.2); // 0-20% variance
    const riskLevel = variance > totalBudgeted * 0.15 ? 'high' : variance > totalBudgeted * 0.1 ? 'medium' : 'low';

    return { expectedVariance: variance, riskLevel };
  }

  createScenario(scenario: Omit<ScenarioModel, 'id'>): ScenarioModel {
    const newScenario: ScenarioModel = {
      id: `SC-${Date.now()}`,
      ...scenario,
    };
    this.scenarios.push(newScenario);
    return newScenario;
  }

  simulateScenarios(scenarios: ScenarioModel[]): { scenarioName: string; impact: number }[] {
    return scenarios.map((scenario) => ({
      scenarioName: scenario.name,
      impact: scenario.projectedProfit,
    }));
  }

  getAllocationRecommendation(totalBudget: number, departments: string[]): Record<string, number> {
    const allocation: Record<string, number> = {};
    const sharePerDept = totalBudget / departments.length;
    departments.forEach((dept) => {
      allocation[dept] = sharePerDept;
    });
    return allocation;
  }

  getRollingForecast(periods: number): { period: string; forecast: number }[] {
    return Array.from({ length: periods }, (_, i) => ({
      period: `Period ${i + 1}`,
      forecast: Math.random() * 1000000 + 500000,
    }));
  }
}
