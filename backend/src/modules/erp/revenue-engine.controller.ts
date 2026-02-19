import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { RevenueEngineService } from './revenue-engine.service';

@Controller('erp/revenue')
export class RevenueEngineController {
    constructor(private readonly revenueEngineService: RevenueEngineService) { }

    /** P1.1: Calculate variable consideration for a contract (Expected Value + MLA) */
    @Post('contracts/:id/variable-consideration')
    calculateVariableConsideration(@Param('id') id: string) {
        return this.revenueEngineService.calculateVariableConsideration(id);
    }

    /** P1.2: Analyze a contract for combination + POB identification */
    @Get('contracts/:id/pob-analysis')
    analyzeContractAndPobs(@Param('id') id: string) {
        return this.revenueEngineService.analyzeContractAndPobs(id);
    }

    /** P1.3: GL reconciliation report for a period (SL to GL) */
    @Get('reconciliation')
    generateGlReconciliation(@Query('period') period: string) {
        return this.revenueEngineService.generateGlReconciliation(period || this._currentPeriod());
    }

    /** P1.4: Run revenue assurance anomaly detection */
    @Get('assurance')
    runRevenueAssurance(@Query('period') period?: string) {
        return this.revenueEngineService.runRevenueAssurance(period);
    }

    /** P1.5: Get the contract modification timeline */
    @Get('contracts/:id/timeline')
    getContractTimeline(@Param('id') id: string) {
        return this.revenueEngineService.getContractTimeline(id);
    }

    private _currentPeriod(): string {
        const now = new Date();
        return `${now.toLocaleString('default', { month: 'short' })}-${now.getFullYear().toString().slice(2)}`;
    }
}
