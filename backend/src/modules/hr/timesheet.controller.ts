import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TimesheetService } from './timesheet.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';

@Controller('api/hr/timesheets')
export class TimesheetController {
  constructor(private readonly timesheetService: TimesheetService) { }

  @Post()
  create(@Body() createTimesheetDto: CreateTimesheetDto) {
    return this.timesheetService.create(createTimesheetDto);
  }

  @Get()
  findAll() {
    return this.timesheetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.timesheetService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTimesheetDto: Partial<CreateTimesheetDto>,
  ) {
    return this.timesheetService.update(id, updateTimesheetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.timesheetService.remove(id);
  }
}
