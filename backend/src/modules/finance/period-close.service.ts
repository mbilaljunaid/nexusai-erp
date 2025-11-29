import { Injectable } from '@nestjs/common';

export interface ClosingChecklistItem {
  id: string;
  name: string;
  description: string;
  responsible: string;
  dueDate: Date;
  completed: boolean;
  validationRule: string;
}

export interface PeriodCloseSummary {
  period: string;
  status: 'open' | 'in-progress' | 'closed';
  completionPercentage: number;
  checklist: ClosingChecklistItem[];
  reconciliationStatus: 'pending' | 'partial' | 'complete';
  journalEntriesCount: number;
  adjustmentEntriesCount: number;
  closingDate?: Date;
}

@Injectable()
export class PeriodCloseService {
  private closingChecklists: Map<string, ClosingChecklistItem[]> = new Map();
  private periodStatuses: Map<string, PeriodCloseSummary> = new Map();

  createPeriod(period: string): PeriodCloseSummary {
    const defaultChecklist: ClosingChecklistItem[] = [
      {
        id: 'bank-recon',
        name: 'Bank Reconciliation',
        description: 'Reconcile all bank accounts',
        responsible: 'Finance Manager',
        dueDate: new Date(),
        completed: false,
        validationRule: 'All bank accounts reconciled',
      },
      {
        id: 'ar-aging',
        name: 'AR Aging Review',
        description: 'Review and age accounts receivable',
        responsible: 'Credit Manager',
        dueDate: new Date(),
        completed: false,
        validationRule: 'AR aging report approved',
      },
      {
        id: 'ap-aging',
        name: 'AP Aging Review',
        description: 'Review accounts payable aging',
        responsible: 'AP Manager',
        dueDate: new Date(),
        completed: false,
        validationRule: 'AP aging report approved',
      },
      {
        id: 'inventory',
        name: 'Inventory Count',
        description: 'Physical inventory count and variance analysis',
        responsible: 'Warehouse Manager',
        dueDate: new Date(),
        completed: false,
        validationRule: 'Inventory variance < 2%',
      },
      {
        id: 'accruals',
        name: 'Accruals & Provisions',
        description: 'Record all accruals and provisions',
        responsible: 'Accountant',
        dueDate: new Date(),
        completed: false,
        validationRule: 'All accruals documented',
      },
    ];

    const summary: PeriodCloseSummary = {
      period,
      status: 'open',
      completionPercentage: 0,
      checklist: defaultChecklist,
      reconciliationStatus: 'pending',
      journalEntriesCount: 0,
      adjustmentEntriesCount: 0,
    };

    this.closingChecklists.set(period, defaultChecklist);
    this.periodStatuses.set(period, summary);
    return summary;
  }

  completeTask(period: string, taskId: string): ClosingChecklistItem | undefined {
    const checklist = this.closingChecklists.get(period);
    if (!checklist) return undefined;

    const task = checklist.find((t) => t.id === taskId);
    if (task) {
      task.completed = true;
      this.updatePeriodStatus(period);
    }
    return task;
  }

  private updatePeriodStatus(period: string): void {
    const checklist = this.closingChecklists.get(period);
    const summary = this.periodStatuses.get(period);

    if (!checklist || !summary) return;

    const completed = checklist.filter((t) => t.completed).length;
    summary.completionPercentage = (completed / checklist.length) * 100;

    if (summary.completionPercentage === 100) {
      summary.status = 'closed';
      summary.closingDate = new Date();
      summary.reconciliationStatus = 'complete';
    } else if (summary.completionPercentage > 0) {
      summary.status = 'in-progress';
    }
  }

  getPeriodStatus(period: string): PeriodCloseSummary | undefined {
    return this.periodStatuses.get(period);
  }

  generateClosingReport(period: string): {
    completedTasks: number;
    remainingTasks: number;
    criticalIssues: string[];
    estimatedClosingDate: Date;
  } {
    const summary = this.periodStatuses.get(period);
    if (!summary) {
      return {
        completedTasks: 0,
        remainingTasks: 0,
        criticalIssues: [],
        estimatedClosingDate: new Date(),
      };
    }

    const checklist = this.closingChecklists.get(period) || [];
    const completed = checklist.filter((t) => t.completed).length;
    const remaining = checklist.length - completed;

    const criticalIssues: string[] = [];
    if (summary.reconciliationStatus === 'pending') {
      criticalIssues.push('Bank reconciliation not started');
    }

    return {
      completedTasks: completed,
      remainingTasks: remaining,
      criticalIssues,
      estimatedClosingDate: new Date(),
    };
  }
}
