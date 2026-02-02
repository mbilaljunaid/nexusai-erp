import { Injectable } from '@nestjs/common';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { Timesheet } from './entities/timesheet.entity';

@Injectable()
export class TimesheetService {
  private timesheets: Timesheet[] = [];
  private idCounter = 1;

  async create(createTimesheetDto: CreateTimesheetDto): Promise<Timesheet> {
    const timesheet: Timesheet = {
      id: this.idCounter++,
      ...createTimesheetDto,
      createdAt: new Date(),
    };
    this.timesheets.push(timesheet);
    return timesheet;
  }

  async findAll(): Promise<Timesheet[]> {
    return this.timesheets;
  }

  async findOne(id: string): Promise<Timesheet | null> {
    return this.timesheets.find(t => t.id === parseInt(id)) || null;
  }

  async update(id: string, updateTimesheetDto: Partial<CreateTimesheetDto>): Promise<Timesheet | null> {
    const timesheet = this.timesheets.find(t => t.id === parseInt(id));
    if (!timesheet) return null;
    Object.assign(timesheet, updateTimesheetDto);
    return timesheet;
  }

  async remove(id: string): Promise<void> {
    const index = this.timesheets.findIndex(t => t.id === parseInt(id));
    if (index > -1) this.timesheets.splice(index, 1);
  }
}
