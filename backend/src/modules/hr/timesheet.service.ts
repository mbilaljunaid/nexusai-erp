import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { timeEntries, employees } from '../../../../shared/schema/hr';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class TimesheetService {
  constructor(
    @Inject(DRIZZLE_DB) private db: NodePgDatabase<{ timeEntries: typeof timeEntries, employees: typeof employees }>,
  ) { }

  async create(createTimesheetDto: CreateTimesheetDto) {
    if (!createTimesheetDto.employeeId) throw new Error('Employee ID required');

    const employee = await this.db.query.employees.findFirst({
      where: eq(employees.id, createTimesheetDto.employeeId)
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const [timesheet] = await this.db.insert(timeEntries).values({
      employeeId: String(createTimesheetDto.employeeId),
      projectId: createTimesheetDto.projectId,
      taskId: createTimesheetDto.taskId,
      date: createTimesheetDto.date ? new Date(createTimesheetDto.date) : new Date(),
      hours: createTimesheetDto.hours?.toString() || '0',
      description: createTimesheetDto.description,
      billableFlag: typeof createTimesheetDto.billableFlag === 'boolean' ? createTimesheetDto.billableFlag : String(createTimesheetDto.billableFlag) === 'true',
      status: 'SUBMITTED'
    } as any).returning();
    return timesheet;
  }

  async findAll() {
    return this.db.query.timeEntries.findMany({
      orderBy: [desc(timeEntries.createdAt)]
    });
  }

  async findOne(id: string) {
    const timesheet = await this.db.query.timeEntries.findFirst({
      where: eq(timeEntries.id, id)
    });
    if (!timesheet) throw new NotFoundException('Timesheet not found');
    return timesheet;
  }

  async update(id: string, updateTimesheetDto: Partial<CreateTimesheetDto>) {
    const [updated] = await this.db.update(timeEntries)
      .set({
        projectId: updateTimesheetDto.projectId,
        taskId: updateTimesheetDto.taskId,
        date: updateTimesheetDto.date ? new Date(updateTimesheetDto.date) : undefined,
        hours: updateTimesheetDto.hours ? updateTimesheetDto.hours.toString() : undefined,
        description: updateTimesheetDto.description,
        billableFlag: updateTimesheetDto.billableFlag !== undefined
          ? (typeof updateTimesheetDto.billableFlag === 'boolean' ? updateTimesheetDto.billableFlag : String(updateTimesheetDto.billableFlag) === 'true')
          : undefined,
        status: updateTimesheetDto.status
      })
      .where(eq(timeEntries.id, id))
      .returning();

    if (!updated) throw new NotFoundException('Timesheet not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const [deleted] = await this.db.delete(timeEntries)
      .where(eq(timeEntries.id, id))
      .returning();
    if (!deleted) throw new NotFoundException('Timesheet not found');
  }
}
