export class CreateGLEntryDto {
  journalDate: Date;
  description: string;
  debitAccount: string;
  debitAmount: number;
  creditAccount: string;
  creditAmount: number;
}
