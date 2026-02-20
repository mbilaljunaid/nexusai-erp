import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { RevenueEngineService } from './revenue-engine.service';
import { RevenueEngineExtensionService } from './revenue-engine-extension.service';

@Controller('erp/revenue')
export class RevenueEngineController {
    constructor(
        private readonly revenueEngineService: RevenueEngineService,
        private readonly extensionService: RevenueEngineExtensionService,
    ) { }

    // ── Core ASC 606 Pipeline (P1.1–P1.5) ────────────────────────────────────

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

    // ── Extension: Material Rights (P1.A-2) ──────────────────────────────────

    /**
     * Analyze customer material rights (renewal/purchase options at significant discount).
     * Body: { options: Array<{ description, optionValue, currentContractPrice, marketStandalonePrice }> }
     */
    @Post('contracts/:id/material-rights')
    analyzeMaterialRights(
        @Param('id') contractId: string,
        @Body() body: { contractNumber: string; options: Array<{ description: string; optionValue: number; currentContractPrice: number; marketStandalonePrice: number }> }
    ) {
        return this.extensionService.analyzeMaterialRights(
            contractId,
            body.contractNumber || contractId,
            body.options || []
        );
    }

    // ── Extension: Significant Financing Component (P1.A-3) ──────────────────

    /**
     * Determine whether a significant financing component exists and compute PV adjustment.
     * Body: { contractNumber, totalTransactionPrice, deliveryMonths, collectionsMonths, marketInterestRatePct }
     */
    @Post('contracts/:id/financing-component')
    analyzeFinancingComponent(
        @Param('id') contractId: string,
        @Body() body: {
            contractNumber: string;
            totalTransactionPrice: number;
            deliveryMonths: number;
            collectionsMonths: number;
            marketInterestRatePct: number;
        }
    ) {
        return this.extensionService.analyzeSignificantFinancingComponent({
            contractId,
            contractNumber: body.contractNumber || contractId,
            totalTransactionPrice: body.totalTransactionPrice || 0,
            deliveryMonths: body.deliveryMonths || 0,
            collectionsMonths: body.collectionsMonths || 0,
            marketInterestRatePct: body.marketInterestRatePct || 5,
        });
    }

    // ── Extension: SSP Audit Log (P1.A-4) ─────────────────────────────────────

    /** Retrieve SSP change audit history (optionally filter by sspRuleId or itemCode) */
    @Get('ssp/audit')
    getSspAuditHistory(
        @Query('sspRuleId') sspRuleId?: string,
        @Query('itemCode') itemCode?: string,
    ) {
        return this.extensionService.getSspAuditHistory(sspRuleId, itemCode);
    }

    /**
     * Record an SSP change audit event.
     * Body: { sspRuleId, itemCode, fieldChanged, previousValue, newValue, changedBy, changeReason }
     */
    @Post('ssp/audit')
    logSspChange(@Body() body: {
        sspRuleId: string;
        itemCode: string;
        fieldChanged: string;
        previousValue: string;
        newValue: string;
        changedBy: string;
        changeReason: string;
    }) {
        return this.extensionService.logSspChange(body);
    }

    // ── Extension: Period Sweep (P1.A-5) ──────────────────────────────────────

    /**
     * Move late-entry Pending schedules from a closed period to the next open period.
     * Body: { closedPeriodName, targetOpenPeriodName }
     */
    @Post('period/sweep')
    runPeriodSweep(@Body() body: { closedPeriodName: string; targetOpenPeriodName: string }) {
        return this.extensionService.runPeriodSweep(
            body.closedPeriodName,
            body.targetOpenPeriodName,
        );
    }

    // ── Extension: Multi-Currency Revaluation (P1.A-6) ────────────────────────

    /**
     * Revalue open foreign-currency revenue contracts to functional currency.
     * Body: { periodName, functionalCurrency? }
     */
    @Post('revaluation')
    revalueMultiCurrencyRevenue(@Body() body: { periodName: string; functionalCurrency?: string }) {
        return this.extensionService.revalueMultiCurrencyRevenue(
            body.periodName || this._currentPeriod(),
            body.functionalCurrency || 'USD',
        );
    }

    // ── Extension: High-Value Contract Approval Gates (P1.A-7) ────────────────

    /**
     * Check if a revenue contract requires approval before activation.
     * Body: { totalAmount, currencyCode, threshold? }
     */
    @Post('contracts/:id/approval-check')
    checkContractApprovalRequired(
        @Param('id') contractId: string,
        @Body() body: { totalAmount: number; currencyCode: string; threshold?: number }
    ) {
        return this.extensionService.checkContractApprovalRequired(
            contractId,
            body.totalAmount || 0,
            body.currencyCode || 'USD',
            body.threshold,
        );
    }

    // ── Revenue Forecasting (Gap R-2) ─────────────────────────────────────────

    /**
     * Generate linear-regression revenue forecast.
     * Query params: months (default: 6), contractId (optional)
     */
    @Get('forecast')
    async getRevenueForecast(
        @Query('months') months?: string,
        @Query('contractId') contractId?: string,
    ) {
        // Dynamic import from server module (shared service boundary)
        // Re-implement lightweight version inline to avoid cross-module coupling
        const monthsToProject = parseInt(months || '6', 10);

        // Delegate to revenueEngineService which has DB access
        return this.revenueEngineService.generateForecast(monthsToProject, contractId);
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private _currentPeriod(): string {
        const now = new Date();
        return `${now.toLocaleString('default', { month: 'short' })}-${now.getFullYear().toString().slice(2)}`;
    }
}
