export class CreateInvoiceDto {
  invoiceNumber: string;
  customerId: string;
  invoiceDate: Date;
  dueDate: Date;
  totalAmount: number;
  description?: string;
}
