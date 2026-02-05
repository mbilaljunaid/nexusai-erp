import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { FinanceGlIntegrationService } from './gl-integration.service';
import { GLEntry } from '../erp/entities/gl-entry.entity';
import { GLBalance } from './entities/gl-balance.entity';

import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GLEntry, GLBalance]),
    AuditModule
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService, FinanceGlIntegrationService],
  exports: [ExpenseService, FinanceGlIntegrationService, TypeOrmModule],
})
export class FinanceModule { }
