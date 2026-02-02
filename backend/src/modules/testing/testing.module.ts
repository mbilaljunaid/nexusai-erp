import { Module } from '@nestjs/common';
import { TestingService } from './testing.service';

@Module({
  providers: [TestingService],
  exports: [TestingService],
})
export class TestingModule {}
