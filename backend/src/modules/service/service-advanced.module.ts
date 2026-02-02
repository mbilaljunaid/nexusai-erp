import { Module } from '@nestjs/common';
import { ServiceAdvancedService } from './service-advanced.service';

@Module({
  providers: [ServiceAdvancedService],
  exports: [ServiceAdvancedService],
})
export class ServiceAdvancedModule {}
