export interface PurchaseOrder {
  id: number;
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
  createdAt: Date;
}
