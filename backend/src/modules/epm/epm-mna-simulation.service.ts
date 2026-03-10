/**
 * EPM M&A Simulation Service — P3.1 Gap Implementation
 *
 * Merges two entity plans into a combined P&L model with:
 *  - Revenue/cost overlay from each entity
 *  - Synergy capture (cost savings, revenue uplift)
 *  - Goodwill calculation (purchase price premium over book equity)
 *  - Combined EBITDA / Net Income model
 *  - Sensitivity analysis (synergy realization %)
 *
 * Oracle Fusion EPM equivalent: Enterprise Planning — Strategic Modeling (M&A module)
 */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

export interface EntityPlan {
    entityId: string;
    entityName: string;
    currencyCode: string;
    period: string;
    revenue: number;
    cogs: number;
    grossProfit: number;
    operatingExpenses: number;
    ebitda: number;
    depreciation: number;
    ebit: number;
    interestExpense: number;
    taxRate: number; // %
    netIncome: number;
    totalAssets: number;
    totalLiabilities: number;
    bookEquity: number;
}

export interface AcquisitionParameters {
    purchasePrice: number;
    currencyCode: string;
    closingDate: string;
    ownershipPct: number; // % of acquired entity (0-100)
    costSynergies: number; // Annual cost savings from integration
    revenueSynergies: number; // Annual revenue uplift from cross-sell
    synergyRealizationPct: number; // % of synergies expected in period 1 (0-100)
    integrationCosts: number; // One-time integration charges
    transactionCosts: number; // Banker fees, legal costs
}

export interface MnaSimulationResult {
    scenario: string;
    period: string;
    acquirer: EntityPlan;
    target: EntityPlan;
    parameters: AcquisitionParameters;
    combined: {
        revenue: number;
        cogs: number;
        grossProfit: number;
        grossMarginPct: number;
        operatingExpenses: number;
        realizedCostSynergies: number;
        realizedRevenueSynergies: number;
        ebitda: number;
        ebitdaMarginPct: number;
        ebit: number;
        interestExpense: number;
        integrationCosts: number;
        transactionCosts: number;
        netIncome: number;
        netMarginPct: number;
    };
    goodwill: number;
    purchasePriceAllocation: {
        bookEquityAcquired: number;
        premiumOverBook: number;
        identifiableIntangibles: number; // estimated at 30% of premium
        goodwill: number;
    };
    synergySensitivity: Array<{
        realizationPct: number;
        costSynergies: number;
        revenueSynergies: number;
        combinedEbitda: number;
        combinedNetIncome: number;
    }>;
    accretionDilution: {
        baselineEPS: number;   // Acquirer standalone EPS (per 1000 shares)
        combinedEPS: number;
        changeEPS: number;
        isAccretive: boolean;
    };
}

@Injectable()
export class EPMMnaSimulationService {
    private readonly logger = new Logger(EPMMnaSimulationService.name);
    private savedScenarios: Map<string, MnaSimulationResult> = new Map();

    /**
     * Runs a full M&A simulation, merging two entity plans into a combined P&L.
     */
    simulateAcquisition(
        scenarioName: string,
        acquirer: EntityPlan,
        target: EntityPlan,
        params: AcquisitionParameters
    ): MnaSimulationResult {
        const ownershipFactor = params.ownershipPct / 100;
        const realizationFactor = params.synergyRealizationPct / 100;

        // Proportional target contribution
        const targetRevenue = target.revenue * ownershipFactor;
        const targetCOGS = target.cogs * ownershipFactor;
        const targetOpex = target.operatingExpenses * ownershipFactor;
        const targetNetIncome = target.netIncome * ownershipFactor;

        // Synergy realization
        const realizedCostSynergies = params.costSynergies * realizationFactor;
        const realizedRevenueSynergies = params.revenueSynergies * realizationFactor;

        // Combined P&L
        const combinedRevenue = acquirer.revenue + targetRevenue + realizedRevenueSynergies;
        const combinedCOGS = acquirer.cogs + targetCOGS;
        const combinedGrossProfit = combinedRevenue - combinedCOGS;
        const grossMarginPct = combinedRevenue > 0 ? (combinedGrossProfit / combinedRevenue) * 100 : 0;

        const combinedOpex = acquirer.operatingExpenses + targetOpex - realizedCostSynergies;
        const combinedEbitda = combinedGrossProfit - combinedOpex;
        const ebitdaMarginPct = combinedRevenue > 0 ? (combinedEbitda / combinedRevenue) * 100 : 0;

        const combinedDepreciation = acquirer.depreciation + target.depreciation * ownershipFactor;
        const combinedEbit = combinedEbitda - combinedDepreciation;
        const combinedInterest = acquirer.interestExpense + target.interestExpense * ownershipFactor;

        const combinedPreTaxIncome = combinedEbit - combinedInterest - params.integrationCosts - params.transactionCosts;
        const blendedTaxRate = (acquirer.taxRate + target.taxRate) / 2 / 100;
        const combinedNetIncome = combinedPreTaxIncome * (1 - blendedTaxRate);
        const netMarginPct = combinedRevenue > 0 ? (combinedNetIncome / combinedRevenue) * 100 : 0;

        // Purchase Price Allocation (simplified IFRS 3 / ASC 805)
        const bookEquityAcquired = target.bookEquity * ownershipFactor;
        const premiumOverBook = params.purchasePrice - bookEquityAcquired;
        const identifiableIntangibles = premiumOverBook * 0.3; // 30% to identifiable intangibles
        const goodwill = premiumOverBook - identifiableIntangibles;

        // Synergy sensitivity (10% / 50% / 75% / 100% / 125%)
        const synergySensitivity = [10, 50, 75, 100, 125].map(pct => {
            const rf = pct / 100;
            const cs = params.costSynergies * rf;
            const rs = params.revenueSynergies * rf;
            const ebitda = combinedGrossProfit - combinedOpex - realizedCostSynergies + cs + rs;
            const ni = (ebitda - combinedDepreciation - combinedInterest) * (1 - blendedTaxRate);
            return { realizationPct: pct, costSynergies: cs, revenueSynergies: rs, combinedEbitda: Number(ebitda.toFixed(2)), combinedNetIncome: Number(ni.toFixed(2)) };
        });

        // Accretion/Dilution analysis (assuming 1000 shares for simplicity)
        const sharesOutstanding = 1000;
        const baselineEPS = acquirer.netIncome / sharesOutstanding;
        const combinedEPS = combinedNetIncome / sharesOutstanding;
        const changeEPS = combinedEPS - baselineEPS;

        const result: MnaSimulationResult = {
            scenario: scenarioName,
            period: acquirer.period,
            acquirer,
            target,
            parameters: params,
            combined: {
                revenue: Number(combinedRevenue.toFixed(2)),
                cogs: Number(combinedCOGS.toFixed(2)),
                grossProfit: Number(combinedGrossProfit.toFixed(2)),
                grossMarginPct: Number(grossMarginPct.toFixed(2)),
                operatingExpenses: Number(combinedOpex.toFixed(2)),
                realizedCostSynergies: Number(realizedCostSynergies.toFixed(2)),
                realizedRevenueSynergies: Number(realizedRevenueSynergies.toFixed(2)),
                ebitda: Number(combinedEbitda.toFixed(2)),
                ebitdaMarginPct: Number(ebitdaMarginPct.toFixed(2)),
                ebit: Number(combinedEbit.toFixed(2)),
                interestExpense: Number(combinedInterest.toFixed(2)),
                integrationCosts: params.integrationCosts,
                transactionCosts: params.transactionCosts,
                netIncome: Number(combinedNetIncome.toFixed(2)),
                netMarginPct: Number(netMarginPct.toFixed(2)),
            },
            goodwill: Number(goodwill.toFixed(2)),
            purchasePriceAllocation: {
                bookEquityAcquired: Number(bookEquityAcquired.toFixed(2)),
                premiumOverBook: Number(premiumOverBook.toFixed(2)),
                identifiableIntangibles: Number(identifiableIntangibles.toFixed(2)),
                goodwill: Number(goodwill.toFixed(2)),
            },
            synergySensitivity,
            accretionDilution: {
                baselineEPS: Number(baselineEPS.toFixed(4)),
                combinedEPS: Number(combinedEPS.toFixed(4)),
                changeEPS: Number(changeEPS.toFixed(4)),
                isAccretive: changeEPS > 0,
            },
        };

        this.savedScenarios.set(scenarioName, result);
        this.logger.log(
            `M&A Simulation "${scenarioName}": Combined EBITDA=${combinedEbitda.toFixed(0)} ` +
            `(${ebitdaMarginPct.toFixed(1)}% margin), Goodwill=${goodwill.toFixed(0)}, ` +
            `Accretive=${changeEPS > 0}`
        );
        return result;
    }

    getScenario(scenarioName: string): MnaSimulationResult {
        const scenario = this.savedScenarios.get(scenarioName);
        if (!scenario) throw new NotFoundException(`M&A scenario "${scenarioName}" not found`);
        return scenario;
    }

    listScenarios(): string[] {
        return Array.from(this.savedScenarios.keys());
    }

    /**
     * Compares two M&A scenarios side-by-side (e.g., full vs partial acquisition).
     */
    compareScenarios(scenarioA: string, scenarioB: string): {
        scenarioA: MnaSimulationResult;
        scenarioB: MnaSimulationResult;
        delta: {
            ebitda: number;
            netIncome: number;
            goodwill: number;
            isAccretive_A: boolean;
            isAccretive_B: boolean;
        };
    } {
        const sA = this.getScenario(scenarioA);
        const sB = this.getScenario(scenarioB);
        return {
            scenarioA: sA, scenarioB: sB,
            delta: {
                ebitda: Number((sA.combined.ebitda - sB.combined.ebitda).toFixed(2)),
                netIncome: Number((sA.combined.netIncome - sB.combined.netIncome).toFixed(2)),
                goodwill: Number((sA.goodwill - sB.goodwill).toFixed(2)),
                isAccretive_A: sA.accretionDilution.isAccretive,
                isAccretive_B: sB.accretionDilution.isAccretive,
            },
        };
    }
}
