
import { Module } from '@nestjs/common';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { FinanceGlIntegrationService } from './gl-integration.service';
import { ConsolidationService } from './consolidation.service';
import { TreasuryDebtService } from './treasury-debt.service';

import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    AuditModule
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService, FinanceGlIntegrationService, ConsolidationService, TreasuryDebtService],
  exports: [ExpenseService, FinanceGlIntegrationService, ConsolidationService, TreasuryDebtService],
})
export class FinanceModule { }
