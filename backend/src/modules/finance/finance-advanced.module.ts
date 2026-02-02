import { Module } from '@nestjs/common';
import { PeriodCloseService } from './period-close.service';
import { FXTranslationService } from './fx-translation.service';
import { FinanceAdvancedController } from './finance-advanced.controller';

@Module({
  providers: [PeriodCloseService, FXTranslationService],
  controllers: [FinanceAdvancedController],
  exports: [PeriodCloseService, FXTranslationService],
})
export class FinanceAdvancedModule {}
