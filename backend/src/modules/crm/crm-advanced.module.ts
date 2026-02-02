import { Module } from '@nestjs/common';
import { TerritoryManagementService } from './territory-management.service';
import { CPQService } from './cpq.service';
import { CRMAdvancedController } from './crm-advanced.controller';

@Module({
  providers: [TerritoryManagementService, CPQService],
  controllers: [CRMAdvancedController],
  exports: [TerritoryManagementService, CPQService],
})
export class CRMAdvancedModule {}
