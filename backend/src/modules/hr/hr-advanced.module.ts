import { Module } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { LearningService } from './learning.service';
import { HRAdvancedController } from './hr-advanced.controller';

@Module({
  providers: [RecruitmentService, LearningService],
  controllers: [HRAdvancedController],
  exports: [RecruitmentService, LearningService],
})
export class HRAdvancedModule {}
