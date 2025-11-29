import { Module } from '@nestjs/common';
import { BPMAdvancedService } from './bpm-advanced.service';

@Module({
  providers: [BPMAdvancedService],
  exports: [BPMAdvancedService],
})
export class BPMAdvancedModule {}
