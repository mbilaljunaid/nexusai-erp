export class CreateTaskDto {
  title: string;
  project: string;
  assignee: string;
  priority: string;
  status: string;
  startDate?: string;
  dueDate: string;
  description?: string;
  dependencies?: string;
  estimatedHours?: string;
}
