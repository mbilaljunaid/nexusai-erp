export class CreateTimesheetDto {
  week: string;
  entries: Array<{
    date: string;
    project: string;
    task: string;
    hours: string;
    notes?: string;
  }>;
}
