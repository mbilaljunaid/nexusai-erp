import { Module } from '@nestjs/common';
import { BankReconciliationService } from './bank-reconciliation.service';
import { MultiEntityService } from './multi-entity.service';
import { TaxEngineService } from './tax-engine.service';
import { ERPAdvancedController } from './erp-advanced.controller';

@Module({
  providers: [BankReconciliationService, MultiEntityService, TaxEngineService],
  controllers: [ERPAdvancedController],
  exports: [BankReconciliationService, MultiEntityService, TaxEngineService],
})
export class ERPAdvancedModule {}
