export interface Leave {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: string;
  reason: string;
  approver?: string;
  replacement?: string;
  createdAt: Date;
}
