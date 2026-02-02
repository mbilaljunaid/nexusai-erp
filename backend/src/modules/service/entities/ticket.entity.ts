export interface Ticket {
  id: number;
  subject: string;
  description: string;
  priority: string;
  category: string;
  customerEmail: string;
  createdAt: Date;
}
