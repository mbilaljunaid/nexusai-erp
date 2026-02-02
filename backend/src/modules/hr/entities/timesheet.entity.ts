export interface Timesheet {
  id: number;
  week: string;
  entries: Array<{
    date: string;
    project: string;
    task: string;
    hours: string;
    notes?: string;
  }>;
  createdAt: Date;
}
