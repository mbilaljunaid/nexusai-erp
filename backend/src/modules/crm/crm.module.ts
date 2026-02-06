import { Module } from '@nestjs/common';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';

@Module({
  imports: [],
  controllers: [LeadController],
  providers: [LeadService],
  exports: [LeadService],
})
export class CRMModule { }
