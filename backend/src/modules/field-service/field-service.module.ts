import { Module } from '@nestjs/common';
import { FieldServiceService } from './field-service.service';

@Module({
  providers: [FieldServiceService],
  exports: [FieldServiceService],
})
export class FieldServiceModule {}
