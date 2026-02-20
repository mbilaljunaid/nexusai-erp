
import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { TimesheetController } from './timesheet.controller';
import { TimesheetService } from './timesheet.service';
import { HrCustomReportService } from './hr-custom-report.service';
import { CoreHrApprovalService } from './core-hr-approval.service';
import { PayrollGlobalConnectorService } from './payroll-global-connector.service';
import { LmsVirtualClassroomService } from './lms-virtual-classroom.service';
import { LmsLearningJourneyService } from './lms-learning-journey.service';
import { TimeRuleController } from './time-rule.controller';
import { TimeRuleService } from './time-rule.service';

@Module({
  controllers: [EmployeeController, LeaveController, TimesheetController, TimeRuleController],
  providers: [EmployeeService, LeaveService, TimesheetService, HrCustomReportService, CoreHrApprovalService, PayrollGlobalConnectorService, LmsVirtualClassroomService, LmsLearningJourneyService, TimeRuleService],
  exports: [EmployeeService, LeaveService, TimesheetService, HrCustomReportService, CoreHrApprovalService, PayrollGlobalConnectorService, LmsVirtualClassroomService, LmsLearningJourneyService, TimeRuleService],
})
export class HRModule { }
