
import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { TimesheetController } from './timesheet.controller';
import { TimesheetService } from './timesheet.service';
import { HrCustomReportService } from './hr-custom-report.service';
import { CoreHrApprovalService } from './core-hr-approval.service';

@Module({
  controllers: [EmployeeController, LeaveController, TimesheetController],
  providers: [EmployeeService, LeaveService, TimesheetService, HrCustomReportService, CoreHrApprovalService],
  exports: [EmployeeService, LeaveService, TimesheetService, HrCustomReportService, CoreHrApprovalService],
})
export class HRModule { }
