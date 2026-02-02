import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { LearningService } from './learning.service';

@Controller('api/hr/advanced')
export class HRAdvancedController {
  constructor(
    private recruitment: RecruitmentService,
    private learning: LearningService,
  ) {}

  @Post('recruitment/create-opening')
  createJobOpening(@Body() opening: any) {
    return this.recruitment.createJobOpening(opening);
  }

  @Post('recruitment/apply/:jobOpeningId')
  applyForJob(@Param('jobOpeningId') jobOpeningId: string, @Body() candidate: any) {
    return this.recruitment.applyForJob(jobOpeningId, candidate);
  }

  @Get('recruitment/candidates/:jobOpeningId')
  getCandidates(@Param('jobOpeningId') jobOpeningId: string) {
    const { opening, candidates } = this.recruitment.getOpeningWithCandidates(jobOpeningId);
    return { opening, candidates };
  }

  @Post('recruitment/move-stage/:candidateId')
  moveToNextStage(@Param('candidateId') candidateId: string) {
    return this.recruitment.moveToNextStage(candidateId);
  }

  @Post('learning/create-course')
  createCourse(@Body() course: any) {
    return this.learning.createCourse(course);
  }

  @Post('learning/enroll/:employeeId/:courseId')
  enrollEmployee(@Param('employeeId') employeeId: string, @Param('courseId') courseId: string) {
    return this.learning.enrollEmployee(employeeId, courseId);
  }

  @Post('learning/create-plan/:employeeId')
  createLearningPlan(@Param('employeeId') employeeId: string, @Body() data: any) {
    return this.learning.createLearningPlan(employeeId, data.goal, data.courseIds);
  }

  @Get('learning/enrollments/:employeeId')
  getEnrollments(@Param('employeeId') employeeId: string) {
    return this.learning.getEmployeeEnrollments(employeeId);
  }
}
