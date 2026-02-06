export class CreateInvoiceDto {
  invoiceNumber!: string;
  customerId!: string;
  invoiceDate!: Date;
  dueDate!: Date;
  amount!: number; // Alias for totalAmount or primary field
  status?: string;
  totalAmount?: number; // kept for compatibility if needed
  description?: string;
}
