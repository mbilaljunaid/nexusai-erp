import { Module } from '@nestjs/common';
import { IntegrationService } from './integration.service';

@Module({
  providers: [IntegrationService],
  exports: [IntegrationService],
})
export class IntegrationModule {}
