import { Module } from '@nestjs/common';
import { UATService } from './uat.service';
import { UATController } from './uat.controller';

@Module({
  controllers: [UATController],
  providers: [UATService],
  exports: [UATService],
})
export class UATModule {}
