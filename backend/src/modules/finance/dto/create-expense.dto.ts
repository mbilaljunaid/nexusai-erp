export class CreateExpenseDto {
  project: string;
  employee: string;
  lines: Array<{
    date: string;
    category: string;
    description: string;
    amount: string;
    receipt?: string;
  }>;
}
