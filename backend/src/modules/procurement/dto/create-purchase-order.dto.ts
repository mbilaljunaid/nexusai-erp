export class CreatePurchaseOrderDto {
  poNumber: string;
  vendor: string;
  poDate: string;
  dueDate: string;
  lines: Array<{
    item: string;
    description: string;
    quantity: string;
    unit: string;
    unitPrice: string;
  }>;
}
