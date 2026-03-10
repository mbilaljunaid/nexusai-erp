export class CreateBudgetDto {
  departmentId!: string;
  year!: number;
  quarter!: number;
  allocatedAmount!: number;
  status?: string;
  notes?: string;
}
