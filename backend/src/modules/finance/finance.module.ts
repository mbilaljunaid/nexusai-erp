import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { GlIntegrationService } from './gl-integration.service';
import { GLEntry } from '../erp/entities/gl-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GLEntry])
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService, GlIntegrationService],
  exports: [ExpenseService, GlIntegrationService],
})
export class FinanceModule { }
