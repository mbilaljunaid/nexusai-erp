import { Module } from '@nestjs/common';
import { AIService } from './ai.service';

@Module({
  controllers: [],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
