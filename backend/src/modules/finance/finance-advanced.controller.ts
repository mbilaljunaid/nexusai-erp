import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PeriodCloseService } from './period-close.service';
import { FXTranslationService } from './fx-translation.service';

@Controller('api/finance/advanced')
export class FinanceAdvancedController {
  constructor(
    private periodClose: PeriodCloseService,
    private fxTranslation: FXTranslationService,
  ) {}

  @Post('period-close/create/:period')
  createPeriod(@Param('period') period: string) {
    return this.periodClose.createPeriod(period);
  }

  @Get('period-close/status/:period')
  getPeriodStatus(@Param('period') period: string) {
    return this.periodClose.getPeriodStatus(period);
  }

  @Post('period-close/complete-task/:period/:taskId')
  completeTask(@Param('period') period: string, @Param('taskId') taskId: string) {
    return this.periodClose.completeTask(period, taskId);
  }

  @Get('period-close/report/:period')
  getClosingReport(@Param('period') period: string) {
    return this.periodClose.generateClosingReport(period);
  }

  @Post('fx-translation/set-rate')
  setExchangeRate(@Body() rate: any) {
    return this.fxTranslation.setExchangeRate(rate);
  }

  @Post('fx-translation/translate')
  translateAmount(@Body() data: any) {
    return this.fxTranslation.translateAmount(
      data.amount,
      data.fromCurrency,
      data.toCurrency,
      data.date ? new Date(data.date) : new Date(),
    );
  }

  @Post('fx-translation/realized-gain')
  calculateRealizedGain(@Body() data: any) {
    return this.fxTranslation.calculateRealizedGain(
      data.originalRate,
      data.settledRate,
      data.amount,
    );
  }
}
