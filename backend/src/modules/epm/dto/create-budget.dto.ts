export class CreateBudgetDto {
  departmentId: string;
  year: number;
  quarter: number;
  allocatedAmount: number;
  notes?: string;
}
