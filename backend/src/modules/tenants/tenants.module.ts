import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Module({
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
