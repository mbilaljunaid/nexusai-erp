import { Module } from '@nestjs/common';
import { CopilotCoreService } from './copilot.service';

@Module({
  providers: [CopilotCoreService],
  exports: [CopilotCoreService],
})
export class CopilotModule { }
