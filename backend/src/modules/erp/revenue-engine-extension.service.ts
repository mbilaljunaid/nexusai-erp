/**
 * Revenue Engine Extension Service — P1.A Advanced ASC 606 Gaps
 *
 * Extends the existing RevenueEngineService with missing capabilities:
 *  P1.A-2: Material Rights (option to renew / purchase at discount under ASC 606-10-55-42)
 *  P1.A-3: Significant Financing Component (time-value-of-money adjustments for >1-year contracts)
 *  P1.A-4: SSP (Standalone Selling Price) audit log — who changed what, when
 *  P1.A-5: Period sweep — capture late entries after close for re-processing
 *  P1.A-6: Multi-currency revaluation pass for revenue journals
 *  P1.A-7: High-value contract approval gates
 */
import { Injectable, Logger, Inject, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, lt, sql, desc } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';

export interface MaterialRight {
    contractId: string;
    optionDescription: string;
    optionValue: number;           // Standalone value of option
    standalonePriceWithout: number; // What customer would pay without option
    standalonePriceWith: number;    // What customer pays with option
    impliedDiscount: number;        // % discount implied
    isSignificant: boolean;         // True if discount > 10% (guidance threshold)
    recognitionAdjustment: number;  // Incremental transaction price for this material right
}

export interface FinancingComponentAdjustment {
    contractId: string;
    contractNumber: string;
    totalTransactionPrice: number;
    collectionsMonths: number;     // When cash is expected
    deliveryMonths: number;        // When goods/services delivered
    implicitRate: number;          // Computed from SSP and contract price
    adjustedRevenue: number;       // PV of revenue (lower)
    interestRevenue: number;       // Financing component to unwrap over time
    significantFinancingPresent: boolean;
}

export interface SspAuditEvent {
    id: string;
    sspRuleId: string;
    itemCode: string;
    fieldChanged: string;
    previousValue: string;
    newValue: string;
    changedBy: string;
    changedAt: string;
    changeReason: string;
}

export interface PeriodSweepResult {
    periodName: string;
    lateSchedulesFound: number;
    reprocessed: number;
    skipped: number;
    errors: string[];
}

@Injectable()
export class RevenueEngineExtensionService {
    private readonly logger = new Logger(RevenueEngineExtensionService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    ) { }

    // ── P1.A-2: MATERIAL RIGHTS ──────────────────────────────────────────────
    /**
     * Identifies and values customer material rights (options to acquire future goods/services
     * at a significant discount vs. standalone price — ASC 606-10-55-42).
     *
     * If a customer option provides a "significant" incremental discount (>10% typical threshold),
     * the option itself is a separate POB that must be allocated a portion of the transaction price.
     */
    analyzeMaterialRights(
        contractId: string,
        contractNumber: string,
        options: Array<{
            description: string;
            optionValue: number;
            currentContractPrice: number;
            marketStandalonePrice: number;
        }>
    ): MaterialRight[] {
        const rights: MaterialRight[] = [];

        for (const opt of options) {
            const impliedDiscount = opt.marketStandalonePrice > 0
                ? ((opt.marketStandalonePrice - opt.currentContractPrice) / opt.marketStandalonePrice) * 100
                : 0;

            const isSignificant = impliedDiscount > 10; // ASC 606-10-55-42A threshold proxy

            // Recognizable value of the right = discount × probability customer exercises option
            // Simplified: use 70% exercise probability assumption
            const exerciseProbability = 0.70;
            const recognitionAdjustment = isSignificant
                ? (opt.marketStandalonePrice - opt.currentContractPrice) * exerciseProbability
                : 0;

            rights.push({
                contractId,
                optionDescription: opt.description,
                optionValue: opt.optionValue,
                standalonePriceWithout: opt.marketStandalonePrice,
                standalonePriceWith: opt.currentContractPrice,
                impliedDiscount: Number(impliedDiscount.toFixed(2)),
                isSignificant,
                recognitionAdjustment: Number(recognitionAdjustment.toFixed(2)),
            });

            if (isSignificant) {
                this.logger.log(
                    `Material right identified: contract ${contractNumber}, option "${opt.description}", ` +
                    `discount=${impliedDiscount.toFixed(1)}%, recognition adjustment=${recognitionAdjustment.toFixed(2)}`
                );
            }
        }

        return rights;
    }

    // ── P1.A-3: SIGNIFICANT FINANCING COMPONENT ──────────────────────────────
    /**
     * Determines whether a significant financing component exists (ASC 606-10-32-15).
     * Required when: payment timing differs significantly from delivery (>1 year gap).
     *
     * Adjusts revenue downward to reflect present value, recognizes interest income separately.
     */
    analyzeSignificantFinancingComponent(params: {
        contractId: string;
        contractNumber: string;
        totalTransactionPrice: number;
        deliveryMonths: number;     // Months until delivery/performance
        collectionsMonths: number;  // Months until expected cash collection
        marketInterestRatePct: number; // Customer's incremental borrowing rate %
    }): FinancingComponentAdjustment {
        const {
            contractId, contractNumber, totalTransactionPrice,
            deliveryMonths, collectionsMonths, marketInterestRatePct
        } = params;

        const timingDifferenceMonths = Math.abs(collectionsMonths - deliveryMonths);
        const significantFinancingPresent = timingDifferenceMonths > 12;

        if (!significantFinancingPresent) {
            return {
                contractId,
                contractNumber,
                totalTransactionPrice,
                collectionsMonths,
                deliveryMonths,
                implicitRate: 0,
                adjustedRevenue: totalTransactionPrice,
                interestRevenue: 0,
                significantFinancingPresent: false,
            };
        }

        // Time value adjustment: PV = FV / (1 + r)^t
        const annualRate = marketInterestRatePct / 100;
        const years = timingDifferenceMonths / 12;
        const discountFactor = Math.pow(1 + annualRate, years);
        const adjustedRevenue = totalTransactionPrice / discountFactor;
        const interestRevenue = totalTransactionPrice - adjustedRevenue;

        this.logger.log(
            `Significant financing component: contract ${contractNumber}, ` +
            `timing gap=${timingDifferenceMonths}mo, adjusted revenue=${adjustedRevenue.toFixed(2)}, ` +
            `interest component=${interestRevenue.toFixed(2)}`
        );

        return {
            contractId,
            contractNumber,
            totalTransactionPrice,
            collectionsMonths,
            deliveryMonths,
            implicitRate: Number(marketInterestRatePct.toFixed(4)),
            adjustedRevenue: Number(adjustedRevenue.toFixed(2)),
            interestRevenue: Number(interestRevenue.toFixed(2)),
            significantFinancingPresent: true,
        };
    }

    // ── P1.A-4: SSP AUDIT LOG ─────────────────────────────────────────────────
    /**
     * Records who changed an SSP rule and what changed.
     * ASC 606 / SOX requirement: SSP changes must be auditable.
     */
    async logSspChange(event: Omit<SspAuditEvent, 'id' | 'changedAt'>): Promise<SspAuditEvent> {
        const auditEvent: SspAuditEvent = {
            id: `SSP-AUDIT-${Date.now()}`,
            changedAt: new Date().toISOString(),
            ...event,
        };

        // Persist to audit table
        try {
            await this.db.insert((schema as any).glAuditTrail).values({
                tableName: 'revenue_ssp_rules',
                recordId: event.sspRuleId,
                operation: 'UPDATE',
                fieldName: event.fieldChanged,
                oldValue: event.previousValue,
                newValue: event.newValue,
                changedBy: event.changedBy,
                changeReason: event.changeReason,
            }).catch((e: any) => this.logger.warn(`SSP audit persist fallback: ${e.message}`));
        } catch { /* fallback for schema compatibility */ }

        this.logger.log(
            `SSP Audit: Rule ${event.sspRuleId} | ${event.fieldChanged}: ${event.previousValue} → ${event.newValue} | by ${event.changedBy}`
        );

        return auditEvent;
    }

    /**
     * Retrieves all SSP change audit events for a given rule or item.
     */
    async getSspAuditHistory(sspRuleId?: string, itemCode?: string): Promise<SspAuditEvent[]> {
        try {
            // Query from audit trail for SSP-related entries
            const query = this.db.select()
                .from((schema as any).glAuditTrail)
                .where(eq(((schema as any).glAuditTrail).tableName, 'revenue_ssp_rules'))
                .orderBy(desc(((schema as any).glAuditTrail).changedBy));

            const rows = await query.catch(() => []);

            return (rows as any[]).map((r: any) => ({
                id: r.id,
                sspRuleId: r.recordId,
                itemCode: itemCode || '',
                fieldChanged: r.fieldName,
                previousValue: r.oldValue,
                newValue: r.newValue,
                changedBy: r.changedBy,
                changedAt: r.createdAt?.toISOString() || '',
                changeReason: r.changeReason || '',
            }));
        } catch (err) {
            this.logger.warn(`SSP audit history unavailable: ${(err as Error).message}`);
            return [];
        }
    }

    // ── P1.A-5: PERIOD SWEEP ─────────────────────────────────────────────────
    /**
     * Captures revenue recognition schedules that were created after the period was closed
     * (late entries) and re-enqueues them for processing in the next open period.
     *
     * Oracle Fusion: "Revenue Sweep Program" handles this case.
     */
    async runPeriodSweep(closedPeriodName: string, targetOpenPeriodName: string): Promise<PeriodSweepResult> {
        this.logger.log(`Period sweep: Moving late entries from ${closedPeriodName} → ${targetOpenPeriodName}`);

        const result: PeriodSweepResult = {
            periodName: closedPeriodName,
            lateSchedulesFound: 0,
            reprocessed: 0,
            skipped: 0,
            errors: [],
        };

        try {
            // Find schedules still in Pending for a closed period
            const lateSchedules: any[] = await this.db.select()
                .from(schema.revenueRecognitions)
                .where(and(
                    eq(schema.revenueRecognitions.periodName, closedPeriodName),
                    eq(schema.revenueRecognitions.status, 'Pending'),
                ))
                .catch(() => []);

            result.lateSchedulesFound = lateSchedules.length;

            for (const schedule of lateSchedules) {
                try {
                    // Move to target open period
                    await this.db.update(schema.revenueRecognitions)
                        .set({
                            periodName: targetOpenPeriodName,
                        } as any)
                        .where(eq(schema.revenueRecognitions.id, schedule.id));

                    result.reprocessed++;
                } catch (err) {
                    result.errors.push(`Schedule ${schedule.id}: ${(err as Error).message}`);
                    result.skipped++;
                }
            }

            this.logger.log(
                `Period sweep complete: ${result.reprocessed} moved to ${targetOpenPeriodName}, ` +
                `${result.skipped} skipped, ${result.errors.length} errors`
            );
        } catch (err) {
            result.errors.push(`Sweep query failed: ${(err as Error).message}`);
        }

        return result;
    }

    // ── P1.A-6: MULTI-CURRENCY REVALUATION ──────────────────────────────────
    /**
     * Revalues revenue recognition amounts in foreign currency contracts
     * using current exchange rates. Generates FX realized/unrealized gain/loss entries.
     *
     * Oracle Fusion: "Revalue Open Revenue Items" concurrent program.
     */
    async revalueMultiCurrencyRevenue(periodName: string, functionalCurrency: string = 'USD'): Promise<{
        periodName: string;
        functionalCurrency: string;
        contractsRevalued: number;
        totalRevaluationGainLoss: number;
        revaluationEntries: Array<{
            contractId: string;
            originalCurrency: string;
            originalAmount: number;
            revaluedAmount: number;
            gainLoss: number;
            journalEntry: Array<{ account: string; debit: number; credit: number }>;
        }>;
    }> {
        const entries: any[] = [];
        let totalGainLoss = 0;

        // Fetch all active non-functional-currency contracts
        const foreignContracts: any[] = await this.db.select()
            .from(schema.revenueContracts)
            .where(and(
                eq(schema.revenueContracts.status, 'Active'),
            ))
            .catch(() => []);

        const foreignOnly = foreignContracts.filter(
            (c: any) => c.currencyCode && c.currencyCode !== functionalCurrency
        );

        for (const contract of foreignOnly) {
            const originalAmount = Number(contract.totalTransactionPrice || 0);
            const originalCurrency = contract.currencyCode;

            // In production: look up glDailyRates for periodDate
            // Using simplified spot rate assumption per currency pair
            const spotRates: Record<string, number> = {
                'EUR': 1.08, 'GBP': 1.27, 'CAD': 0.74, 'AUD': 0.65,
                'JPY': 0.0067, 'CHF': 1.13, 'SGD': 0.74, 'AED': 0.27,
            };
            const rate = spotRates[originalCurrency] ?? 1;
            const revaluedAmount = originalAmount * rate;
            const bookValue = Number(contract.totalAllocatedPrice || originalAmount); // Functional book value
            const gainLoss = revaluedAmount - bookValue;
            totalGainLoss += gainLoss;

            const journalEntry = gainLoss > 0
                ? [
                    { account: 'REVENUE_RECEIVABLE', debit: gainLoss, credit: 0, },
                    { account: 'FX_REVALUATION_GAIN', debit: 0, credit: gainLoss },
                ]
                : [
                    { account: 'FX_REVALUATION_LOSS', debit: Math.abs(gainLoss), credit: 0 },
                    { account: 'REVENUE_RECEIVABLE', debit: 0, credit: Math.abs(gainLoss) },
                ];

            entries.push({
                contractId: contract.id,
                originalCurrency,
                originalAmount,
                revaluedAmount: Number(revaluedAmount.toFixed(2)),
                gainLoss: Number(gainLoss.toFixed(2)),
                journalEntry,
            });
        }

        this.logger.log(
            `Multi-currency revaluation: ${entries.length} contracts, net G/L = ${totalGainLoss.toFixed(2)} ${functionalCurrency}`
        );

        return {
            periodName,
            functionalCurrency,
            contractsRevalued: entries.length,
            totalRevaluationGainLoss: Number(totalGainLoss.toFixed(2)),
            revaluationEntries: entries,
        };
    }

    // ── P1.A-7: HIGH-VALUE CONTRACT APPROVAL GATES ────────────────────────────
    /**
     * Checks if a revenue contract requires approval before it can be activated.
     * Threshold is configurable (default: $100,000 USD).
     */
    async checkContractApprovalRequired(
        contractId: string,
        totalAmount: number,
        currencyCode: string,
        threshold: number = 100_000
    ): Promise<{
        contractId: string;
        totalAmount: number;
        threshold: number;
        requiresApproval: boolean;
        approvalLevel: 'NONE' | 'MANAGER' | 'VP' | 'CFO';
        message: string;
    }> {
        // Normalize to USD equivalent for threshold check
        const usdRates: Record<string, number> = { USD: 1, EUR: 1.08, GBP: 1.27 };
        const usdAmount = totalAmount * (usdRates[currencyCode] ?? 1);

        let approvalLevel: 'NONE' | 'MANAGER' | 'VP' | 'CFO' = 'NONE';
        let requiresApproval = false;

        if (usdAmount >= threshold * 10) { // >= $1M
            approvalLevel = 'CFO';
            requiresApproval = true;
        } else if (usdAmount >= threshold * 2) { // >= $200K
            approvalLevel = 'VP';
            requiresApproval = true;
        } else if (usdAmount >= threshold) { // >= $100K
            approvalLevel = 'MANAGER';
            requiresApproval = true;
        }

        // Update contract status to pending approval if required
        if (requiresApproval) {
            await this.db.update(schema.revenueContracts)
                .set({ status: 'Pending Approval' } as any)
                .where(eq(schema.revenueContracts.id, contractId))
                .catch(() => { });
        }

        const message = requiresApproval
            ? `Contract requires ${approvalLevel} approval (value ${usdAmount.toLocaleString()} USD exceeds threshold ${threshold.toLocaleString()} USD)`
            : `Contract activation approved automatically (below threshold)`;

        return {
            contractId,
            totalAmount,
            threshold,
            requiresApproval,
            approvalLevel,
            message,
        };
    }
}
