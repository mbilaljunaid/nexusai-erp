/**
 * Treasury Debt & Investment Service — P1.F Remediations
 *
 * Implements missing Oracle Fusion Treasury capabilities:
 *  P1.F-1: DebtService — loan drawdowns, principal repayments, interest accruals, covenant monitoring
 *  P1.F-2: InvestmentService — money market, term deposits, mark-to-market
 *  P1.F-3: FxHedgingService — FX forward/option hedging instruments, hedge effectiveness (ASC 815 / IFRS 9)
 */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface DebtFacility {
    id?: string;
    facilityName: string;
    lenderName: string;
    facilityType: 'Revolving' | 'Term' | 'Bridge' | 'Syndicated';
    currency: string;
    totalCommitment: number;
    outstandingBalance: number;
    interestRate: number; // annual %
    rateType: 'Fixed' | 'Floating';
    baseRate?: string; // e.g. "SOFR", "EURIBOR"
    spread?: number; // basis points for floating
    maturityDate: Date;
    covenants: DebtCovenant[];
}

export interface DebtCovenant {
    covenantType: 'Leverage' | 'Coverage' | 'Liquidity' | 'Other';
    description: string;
    threshold: number;
    currentValue: number;
    inCompliance: boolean;
    testFrequency: 'Monthly' | 'Quarterly' | 'Annual';
}

export interface InvestmentPosition {
    id?: string;
    instrumentType: 'MoneyMarket' | 'TermDeposit' | 'TBill' | 'Bond' | 'EquityFund';
    counterparty: string;
    currency: string;
    principalAmount: number;
    currentMarketValue: number;
    unrealizedGainLoss: number;
    yieldRate: number;
    maturityDate?: Date;
    creditRating: string;
}

export interface FxHedge {
    id?: string;
    hedgeType: 'FxForward' | 'FxOption' | 'CrossCurrencySwap';
    exposureType: 'CashFlow' | 'FairValue' | 'NetInvestment';
    hedgedItemDescription: string;
    buyCurrency: string;
    sellCurrency: string;
    notionalAmount: number;
    strikeRate: number;
    forwardRate: number;
    premium?: number; // for options
    tradeDate: Date;
    settlementDate: Date;
    fairValue: number;
    hedgeEffectiveness: number; // 0-100%
    isHighlyEffective: boolean; // ≥ 80% threshold (ASC 815)
    status: 'Active' | 'Matured' | 'Closed';
}

@Injectable()
export class TreasuryDebtService {
    private readonly logger = new Logger(TreasuryDebtService.name);

    // In-memory repositories (production would use Drizzle DB tables)
    private debtFacilities: Map<string, DebtFacility> = new Map();
    private investments: Map<string, InvestmentPosition> = new Map();
    private fxHedges: Map<string, FxHedge> = new Map();

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    ) { }

    // ── P1.F-1: DEBT MANAGEMENT ───────────────────────────────────────────────
    /**
     * Creates a new debt facility (credit line / term loan).
     */
    createDebtFacility(facility: Omit<DebtFacility, 'id'>): DebtFacility {
        const id = `DEBT-${Date.now()}`;
        const full: DebtFacility = { id, ...facility };
        this.debtFacilities.set(id, full);
        this.logger.log(`Debt facility created: ${facility.facilityName} (${facility.currency} ${facility.totalCommitment.toLocaleString()})`);
        return full;
    }

    /**
     * Records a drawdown on a revolving or term facility.
     */
    recordDrawdown(facilityId: string, amount: number, valueDate: Date): {
        facilityId: string;
        drawdownAmount: number;
        newOutstanding: number;
        availableHeadroom: number;
        valueDate: Date;
        journalEntry: Array<{ account: string; debit: number; credit: number }>;
    } {
        const facility = this.debtFacilities.get(facilityId);
        if (!facility) throw new Error(`Debt facility ${facilityId} not found`);

        const headroom = facility.totalCommitment - facility.outstandingBalance;
        if (amount > headroom) throw new Error(`Drawdown of ${amount} exceeds available headroom of ${headroom}`);

        facility.outstandingBalance += amount;

        return {
            facilityId,
            drawdownAmount: amount,
            newOutstanding: facility.outstandingBalance,
            availableHeadroom: facility.totalCommitment - facility.outstandingBalance,
            valueDate,
            journalEntry: [
                { account: 'CASH', debit: amount, credit: 0 },
                { account: 'LONG_TERM_DEBT', debit: 0, credit: amount },
            ],
        };
    }

    /**
     * Accrues interest expense for all active facilities up to the given date.
     */
    accrueInterest(asOfDate: Date = new Date()): Array<{
        facilityId: string;
        facilityName: string;
        principal: number;
        annualRate: number;
        daysAccrued: number;
        interestAmount: number;
        journalEntry: Array<{ account: string; debit: number; credit: number }>;
    }> {
        const results = [];

        for (const [id, facility] of this.debtFacilities) {
            if (facility.outstandingBalance <= 0) continue;

            const daysInYear = 360;
            const daysAccrued = 1; // Daily accrual default
            const interestAmount = (facility.outstandingBalance * (facility.interestRate / 100)) / daysInYear * daysAccrued;

            results.push({
                facilityId: id,
                facilityName: facility.facilityName,
                principal: facility.outstandingBalance,
                annualRate: facility.interestRate,
                daysAccrued,
                interestAmount: Number(interestAmount.toFixed(2)),
                journalEntry: [
                    { account: 'INTEREST_EXPENSE', debit: interestAmount, credit: 0 },
                    { account: 'ACCRUED_INTEREST_PAYABLE', debit: 0, credit: interestAmount },
                ],
            });
        }

        this.logger.log(`Interest accrued for ${results.length} facilities as of ${asOfDate.toISOString()}`);
        return results;
    }

    /**
     * Runs covenant compliance checks on all debt facilities.
     */
    checkCovenants(): Array<{
        facilityId: string;
        facilityName: string;
        covenantStatus: 'COMPLIANT' | 'BREACH' | 'WARNING';
        breaches: DebtCovenant[];
        warnings: DebtCovenant[];
    }> {
        const results = [];

        for (const [id, facility] of this.debtFacilities) {
            const breaches = facility.covenants.filter(c => !c.inCompliance);
            // Warning: within 10% of threshold
            const warnings = facility.covenants.filter(c => {
                if (!c.inCompliance) return false;
                const buffer = Math.abs(c.currentValue - c.threshold) / Math.abs(c.threshold);
                return buffer < 0.10;
            });

            let status: 'COMPLIANT' | 'BREACH' | 'WARNING' = 'COMPLIANT';
            if (breaches.length > 0) status = 'BREACH';
            else if (warnings.length > 0) status = 'WARNING';

            results.push({ facilityId: id, facilityName: facility.facilityName, covenantStatus: status, breaches, warnings });

            if (status === 'BREACH') {
                this.logger.warn(`COVENANT BREACH: ${facility.facilityName} has ${breaches.length} breached covenant(s)`);
            }
        }

        return results;
    }

    listDebtFacilities(): DebtFacility[] {
        return Array.from(this.debtFacilities.values());
    }

    // ── P1.F-2: INVESTMENT MANAGEMENT ────────────────────────────────────────
    /**
     * Creates a new investment position.
     */
    createInvestment(position: Omit<InvestmentPosition, 'id' | 'unrealizedGainLoss'>): InvestmentPosition {
        const id = `INV-${Date.now()}`;
        const unrealizedGainLoss = position.currentMarketValue - position.principalAmount;
        const full: InvestmentPosition = { id, ...position, unrealizedGainLoss };
        this.investments.set(id, full);
        this.logger.log(`Investment created: ${position.instrumentType} ${position.currency} ${position.principalAmount.toLocaleString()} @ ${position.counterparty}`);
        return full;
    }

    /**
     * Mark-to-market: revalues all investment positions at current market prices.
     */
    markToMarket(marketPrices: Record<string, number>): Array<{
        investmentId: string;
        instrumentType: string;
        previousMarketValue: number;
        newMarketValue: number;
        mtmChange: number;
        unrealizedGainLoss: number;
        journalEntry: Array<{ account: string; debit: number; credit: number }>;
    }> {
        const results = [];

        for (const [id, position] of this.investments) {
            const prevValue = position.currentMarketValue;
            const newValue = marketPrices[id] ?? prevValue; // Use provided price or unchanged
            const mtmChange = newValue - prevValue;
            position.currentMarketValue = newValue;
            position.unrealizedGainLoss = newValue - position.principalAmount;

            const journalEntry = mtmChange > 0
                ? [{ account: 'INVESTMENT_ASSET', debit: mtmChange, credit: 0 }, { account: 'UNREALIZED_GAIN', debit: 0, credit: mtmChange }]
                : [{ account: 'UNREALIZED_LOSS', debit: Math.abs(mtmChange), credit: 0 }, { account: 'INVESTMENT_ASSET', debit: 0, credit: Math.abs(mtmChange) }];

            results.push({
                investmentId: id,
                instrumentType: position.instrumentType,
                previousMarketValue: prevValue,
                newMarketValue: newValue,
                mtmChange,
                unrealizedGainLoss: position.unrealizedGainLoss,
                journalEntry,
            });
        }

        this.logger.log(`Mark-to-market complete: ${results.length} positions revalued`);
        return results;
    }

    listInvestments(): InvestmentPosition[] {
        return Array.from(this.investments.values());
    }

    getInvestmentPortfolioSummary(): {
        totalPrincipal: number;
        totalMarketValue: number;
        totalUnrealizedGainLoss: number;
        byType: Record<string, { count: number; principal: number; marketValue: number }>;
    } {
        const positions = Array.from(this.investments.values());

        const summary = {
            totalPrincipal: 0,
            totalMarketValue: 0,
            totalUnrealizedGainLoss: 0,
            byType: {} as Record<string, { count: number; principal: number; marketValue: number }>,
        };

        for (const p of positions) {
            summary.totalPrincipal += p.principalAmount;
            summary.totalMarketValue += p.currentMarketValue;
            summary.totalUnrealizedGainLoss += p.unrealizedGainLoss;

            if (!summary.byType[p.instrumentType]) {
                summary.byType[p.instrumentType] = { count: 0, principal: 0, marketValue: 0 };
            }
            summary.byType[p.instrumentType].count++;
            summary.byType[p.instrumentType].principal += p.principalAmount;
            summary.byType[p.instrumentType].marketValue += p.currentMarketValue;
        }

        return summary;
    }

    // ── P1.F-3: FX HEDGING ────────────────────────────────────────────────────
    /**
     * Creates a new FX hedging instrument (forward contract, option, or cross-currency swap).
     * Validates hedge effectiveness per ASC 815 / IFRS 9 (≥ 80% to qualify as hedge accounting).
     */
    createFxHedge(hedge: Omit<FxHedge, 'id' | 'isHighlyEffective'>): FxHedge {
        const id = `HEDGE-${Date.now()}`;
        const isHighlyEffective = hedge.hedgeEffectiveness >= 80;
        const full: FxHedge = { id, ...hedge, isHighlyEffective };
        this.fxHedges.set(id, full);

        if (!isHighlyEffective) {
            this.logger.warn(`Hedge ${id} effectiveness ${hedge.hedgeEffectiveness}% < 80% — NOT eligible for hedge accounting`);
        } else {
            this.logger.log(`FX Hedge created: ${hedge.hedgeType} ${hedge.buyCurrency}/${hedge.sellCurrency} notional=${hedge.notionalAmount.toLocaleString()}`);
        }
        return full;
    }

    /**
     * Measures hedge effectiveness using the dollar-offset method.
     * Compares fair value change of hedging instrument vs hedged item.
     */
    measureHedgeEffectiveness(hedgeId: string, hedgingInstrumentFVChange: number, hedgedItemFVChange: number): {
        hedgeId: string;
        hedgeType: string;
        hedgingInstrumentFVChange: number;
        hedgedItemFVChange: number;
        effectivenessRatio: number;
        effectivenessPct: number;
        isHighlyEffective: boolean;
        qualifiesForHedgeAccounting: boolean;
        recommendation: string;
    } {
        const hedge = this.fxHedges.get(hedgeId);
        if (!hedge) throw new Error(`FX Hedge ${hedgeId} not found`);

        // Dollar-offset method: ratio of hedging instrument change to hedged item change
        const ratio = hedgedItemFVChange !== 0 ? Math.abs(hedgingInstrumentFVChange / hedgedItemFVChange) : 0;
        const effectivenessPct = ratio * 100;

        // ASC 815: 80-125% effectiveness range qualifies for hedge accounting
        const qualifiesForHedgeAccounting = effectivenessPct >= 80 && effectivenessPct <= 125;
        hedge.hedgeEffectiveness = effectivenessPct;
        hedge.isHighlyEffective = qualifiesForHedgeAccounting;
        hedge.fairValue = (hedge.fairValue || 0) + hedgingInstrumentFVChange;

        const recommendation = qualifiesForHedgeAccounting
            ? 'Hedge qualifies for hedge accounting — record effective portion in OCI'
            : `Hedge does NOT qualify (${effectivenessPct.toFixed(1)}% outside 80-125% range) — designate as trading instrument`;

        return {
            hedgeId,
            hedgeType: hedge.hedgeType,
            hedgingInstrumentFVChange,
            hedgedItemFVChange,
            effectivenessRatio: Number(ratio.toFixed(4)),
            effectivenessPct: Number(effectivenessPct.toFixed(2)),
            isHighlyEffective: qualifiesForHedgeAccounting,
            qualifiesForHedgeAccounting,
            recommendation,
        };
    }

    /**
     * Generates cash flow hedge accounting entries (ASC 815):
     *   - Effective portion → Other Comprehensive Income (OCI)
     *   - Ineffective portion → P&L (Hedge Ineffectiveness)
     */
    generateHedgeAccountingEntries(hedgeId: string, totalFVChange: number): {
        hedgeId: string;
        effectivePortion: number;
        ineffectivePortion: number;
        ociEntry: Array<{ account: string; debit: number; credit: number }>;
        plEntry: Array<{ account: string; debit: number; credit: number }>;
    } {
        const hedge = this.fxHedges.get(hedgeId);
        if (!hedge) throw new Error(`FX Hedge ${hedgeId} not found`);

        const effectivenessFraction = Math.min(hedge.hedgeEffectiveness / 100, 1.0);
        const effectivePortion = totalFVChange * effectivenessFraction;
        const ineffectivePortion = totalFVChange - effectivePortion;

        const ociEntry = effectivePortion > 0
            ? [{ account: 'HEDGE_ASSET', debit: effectivePortion, credit: 0 }, { account: 'OCI_CASH_FLOW_HEDGE', debit: 0, credit: effectivePortion }]
            : [{ account: 'OCI_CASH_FLOW_HEDGE', debit: Math.abs(effectivePortion), credit: 0 }, { account: 'HEDGE_LIABILITY', debit: 0, credit: Math.abs(effectivePortion) }];

        const plEntry = ineffectivePortion !== 0
            ? [
                { account: 'HEDGE_INSTRUMENT', debit: ineffectivePortion > 0 ? ineffectivePortion : 0, credit: ineffectivePortion < 0 ? Math.abs(ineffectivePortion) : 0 },
                { account: 'HEDGE_INEFFECTIVENESS_PL', debit: ineffectivePortion < 0 ? Math.abs(ineffectivePortion) : 0, credit: ineffectivePortion > 0 ? ineffectivePortion : 0 },
            ]
            : [];

        return { hedgeId, effectivePortion, ineffectivePortion, ociEntry, plEntry };
    }

    listFxHedges(): FxHedge[] {
        return Array.from(this.fxHedges.values());
    }

    getFxHedgeRiskSummary(): {
        totalActiveHedges: number;
        totalNotionalValue: number;
        highlyEffectiveCount: number;
        notQualifyingCount: number;
        totalFairValue: number;
    } {
        const hedges = Array.from(this.fxHedges.values()).filter(h => h.status === 'Active');
        return {
            totalActiveHedges: hedges.length,
            totalNotionalValue: hedges.reduce((sum, h) => sum + h.notionalAmount, 0),
            highlyEffectiveCount: hedges.filter(h => h.isHighlyEffective).length,
            notQualifyingCount: hedges.filter(h => !h.isHighlyEffective).length,
            totalFairValue: hedges.reduce((sum, h) => sum + h.fairValue, 0),
        };
    }
}
