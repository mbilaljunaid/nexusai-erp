export class CreateLeaveDto {
  leaveType: string;
  startDate: string;
  endDate: string;
  days: string;
  reason: string;
  approver?: string;
  replacement?: string;
}
