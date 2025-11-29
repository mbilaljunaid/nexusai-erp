import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TimesheetService } from './timesheet.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { Timesheet } from './entities/timesheet.entity';

@Controller('api/hr/timesheets')
export class TimesheetController {
  constructor(private readonly timesheetService: TimesheetService) {}

  @Post()
  create(@Body() createTimesheetDto: CreateTimesheetDto): Promise<Timesheet> {
    return this.timesheetService.create(createTimesheetDto);
  }

  @Get()
  findAll(): Promise<Timesheet[]> {
    return this.timesheetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Timesheet | null> {
    return this.timesheetService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTimesheetDto: Partial<CreateTimesheetDto>,
  ): Promise<Timesheet | null> {
    return this.timesheetService.update(id, updateTimesheetDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.timesheetService.remove(id);
  }
}
