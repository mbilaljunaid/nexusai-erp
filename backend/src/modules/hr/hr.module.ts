import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { TimesheetController } from './timesheet.controller';
import { TimesheetService } from './timesheet.service';

@Module({
  controllers: [EmployeeController, LeaveController, TimesheetController],
  providers: [EmployeeService, LeaveService, TimesheetService],
  exports: [EmployeeService, LeaveService, TimesheetService],
})
export class HRModule {}
