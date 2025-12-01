/**
 * Analytics Engine - Phase 5
 * Reporting and analytics for forms and workflows
 */

export interface FormAnalytics {
  formId: string;
  totalSubmissions: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  averageProcessingTime: number; // in hours
  successRate: number; // percentage
  topField?: string;
  commonErrors: { field: string; count: number }[];
}

export interface WorkflowAnalytics {
  formId: string;
  totalWorkflows: number;
  averageStepDuration: number;
  bottleneckStep?: string;
  autoCompletionRate: number;
  manualInterventionRate: number;
}

export interface GLAnalytics {
  period: { start: Date; end: Date };
  totalTransactions: number;
  totalDebits: number;
  totalCredits: number;
  accountBalances: { account: string; balance: number }[];
  topAccounts: { account: string; volume: number }[];
  discrepanciesCount: number;
}

export class AnalyticsEngine {
  private submissions: any[] = [];
  private workflows: any[] = [];
  private glEntries: any[] = [];

  /**
   * Record form submission
   */
  recordSubmission(formId: string, data: any, status: string, processingTime?: number): void {
    this.submissions.push({
      formId,
      timestamp: new Date(),
      status,
      processingTime,
      data,
    });
  }

  /**
   * Record workflow event
   */
  recordWorkflowEvent(formId: string, event: any): void {
    this.workflows.push({
      formId,
      timestamp: new Date(),
      event,
    });
  }

  /**
   * Record GL entry
   */
  recordGLEntry(entry: any): void {
    this.glEntries.push({
      ...entry,
      recordedAt: new Date(),
    });
  }

  /**
   * Get form analytics
   */
  getFormAnalytics(formId: string): FormAnalytics {
    const submissions = this.submissions.filter((s) => s.formId === formId);
    const total = submissions.length;

    const approved = submissions.filter((s) => s.status === "approved").length;
    const rejected = submissions.filter((s) => s.status === "rejected").length;
    const pending = submissions.filter((s) => s.status === "pending").length;

    const avgTime = submissions.reduce((sum, s) => sum + (s.processingTime || 0), 0) / Math.max(total, 1);

    return {
      formId,
      totalSubmissions: total,
      approvedCount: approved,
      rejectedCount: rejected,
      pendingCount: pending,
      averageProcessingTime: avgTime,
      successRate: (approved / Math.max(total, 1)) * 100,
      commonErrors: [],
    };
  }

  /**
   * Get workflow analytics
   */
  getWorkflowAnalytics(formId: string): WorkflowAnalytics {
    const workflows = this.workflows.filter((w) => w.formId === formId);

    return {
      formId,
      totalWorkflows: workflows.length,
      averageStepDuration: 0,
      autoCompletionRate: 0,
      manualInterventionRate: 0,
    };
  }

  /**
   * Get GL analytics
   */
  getGLAnalytics(startDate: Date, endDate: Date): GLAnalytics {
    const entries = this.glEntries.filter((e) => e.recordedAt >= startDate && e.recordedAt <= endDate);

    const totalDebits = entries
      .filter((e) => e.debitCredit === "debit")
      .reduce((sum, e) => sum + e.amount, 0);

    const totalCredits = entries
      .filter((e) => e.debitCredit === "credit")
      .reduce((sum, e) => sum + e.amount, 0);

    const accountBalances: Record<string, number> = {};
    for (const entry of entries) {
      const delta = entry.debitCredit === "debit" ? entry.amount : -entry.amount;
      accountBalances[entry.account] = (accountBalances[entry.account] || 0) + delta;
    }

    return {
      period: { start: startDate, end: endDate },
      totalTransactions: entries.length,
      totalDebits,
      totalCredits,
      accountBalances: Object.entries(accountBalances).map(([account, balance]) => ({ account, balance })),
      topAccounts: [],
      discrepanciesCount: 0,
    };
  }
}

export const analyticsEngine = new AnalyticsEngine();
