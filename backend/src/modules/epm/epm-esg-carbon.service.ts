/**
 * EPM ESG Carbon Roadmap Service — P3.2 Gap Implementation
 *
 * Manages ESG carbon targets vs actuals across Scope 1, 2, 3 emissions:
 *  - Carbon target setting per scope per year
 *  - Actual emissions recording
 *  - Progress tracking vs reduction roadmap
 *  - Scope 3 category breakdown (15 categories per GHG Protocol)
 *  - DEI target setting and progress tracking
 *
 * Oracle Fusion EPM equivalent: Oracle ESG Planning Cloud
 */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

export type EmissionScope = 'SCOPE_1' | 'SCOPE_2' | 'SCOPE_3';

export type Scope3Category =
    | 'purchased_goods' | 'capital_goods' | 'fuel_energy' | 'upstream_transport'
    | 'waste' | 'business_travel' | 'employee_commuting' | 'upstream_leased'
    | 'downstream_transport' | 'processing_sold' | 'use_sold' | 'end_life_sold'
    | 'downstream_leased' | 'franchises' | 'investments';

export interface CarbonTarget {
    id: string;
    tenantId: string;
    year: number;
    scope: EmissionScope;
    scope3Category?: Scope3Category;
    targetMtCO2e: number; // Metric tons CO2 equivalent
    baselineYear: number;
    baselineMtCO2e: number;
    targetReductionPct: number; // % reduction from baseline
    notes?: string;
}

export interface CarbonActual {
    id: string;
    tenantId: string;
    year: number;
    quarter?: number;
    scope: EmissionScope;
    scope3Category?: Scope3Category;
    actualMtCO2e: number;
    dataSource: string; // 'METER' | 'INVOICE' | 'ESTIMATE' | 'SURVEY'
    verifiedBy?: string;
    recordedAt: Date;
}

export interface CarbonProgressReport {
    tenantId: string;
    year: number;
    reportDate: Date;
    scopes: Array<{
        scope: EmissionScope;
        baselineMtCO2e: number;
        targetMtCO2e: number;
        actualMtCO2e: number;
        remainingTarget: number;
        progressPct: number; // % of reduction achieved
        onTrack: boolean;
        trend: 'IMPROVING' | 'WORSENING' | 'FLAT';
    }>;
    totalTargetMtCO2e: number;
    totalActualMtCO2e: number;
    netReductionFromBaseline: number;
    netReductionPct: number;
    scienceBasedTargetAligned: boolean; // 1.5°C pathway: ~4.2% annual reduction
}

export interface DeiTarget {
    id: string;
    tenantId: string;
    year: number;
    dimension: 'GENDER_LEADERSHIP' | 'ETHNICITY_LEADERSHIP' | 'PAY_EQUITY' | 'INCLUSION_SCORE' | 'ACCESSIBILITY';
    targetValue: number;
    targetUnit: string; // '%' | 'ratio' | 'score'
    currentValue?: number;
    description: string;
}

@Injectable()
export class EPMEsgCarbonService {
    private readonly logger = new Logger(EPMEsgCarbonService.name);
    private readonly SBT_ANNUAL_REDUCTION_PCT = 4.2; // Science-based target: 1.5°C pathway

    private targets: Map<string, CarbonTarget> = new Map();
    private actuals: Map<string, CarbonActual> = new Map();
    private deiTargets: Map<string, DeiTarget> = new Map();

    // ── Carbon Target Management ──────────────────────────────────────────────
    setCarbonTarget(input: Omit<CarbonTarget, 'id'>): CarbonTarget {
        const id = `TGT-${input.scope}-${input.year}-${Date.now()}`;
        const target: CarbonTarget = { id, ...input };
        this.targets.set(id, target);
        this.logger.log(`Carbon target set: ${input.scope} ${input.year} = ${input.targetMtCO2e} MtCO2e (${input.targetReductionPct}% reduction)`);
        return target;
    }

    updateCarbonTarget(id: string, updates: Partial<CarbonTarget>): CarbonTarget {
        const target = this.targets.get(id);
        if (!target) throw new NotFoundException(`Carbon target ${id} not found`);
        Object.assign(target, updates);
        return target;
    }

    listTargets(tenantId: string, year?: number): CarbonTarget[] {
        return Array.from(this.targets.values())
            .filter(t => t.tenantId === tenantId && (year == null || t.year === year));
    }

    // ── Emissions Actuals Recording ───────────────────────────────────────────
    recordEmissions(input: Omit<CarbonActual, 'id' | 'recordedAt'>): CarbonActual {
        const id = `ACT-${input.scope}-${input.year}-${Date.now()}`;
        const actual: CarbonActual = { id, ...input, recordedAt: new Date() };
        this.actuals.set(id, actual);
        this.logger.log(`Emissions recorded: ${input.scope} ${input.year} Q${input.quarter || 'full'} = ${input.actualMtCO2e} MtCO2e (source: ${input.dataSource})`);
        return actual;
    }

    listActuals(tenantId: string, year: number): CarbonActual[] {
        return Array.from(this.actuals.values())
            .filter(a => a.tenantId === tenantId && a.year === year);
    }

    // ── Progress Report ───────────────────────────────────────────────────────
    /**
     * Generates a full carbon progress report for a given year.
     * Compares actuals against reduction targets by scope.
     */
    generateProgressReport(tenantId: string, year: number): CarbonProgressReport {
        const yearTargets = this.listTargets(tenantId, year);
        const yearActuals = this.listActuals(tenantId, year);

        const scopes: EmissionScope[] = ['SCOPE_1', 'SCOPE_2', 'SCOPE_3'];
        const scopeReports = scopes.map(scope => {
            const target = yearTargets.find(t => t.scope === scope && !t.scope3Category);
            const scopeActuals = yearActuals.filter(a => a.scope === scope);
            const actualMtCO2e = scopeActuals.reduce((s, a) => s + a.actualMtCO2e, 0);
            const targetMtCO2e = target?.targetMtCO2e ?? 0;
            const baselineMtCO2e = target?.baselineMtCO2e ?? 0;

            const reductionFromBaseline = baselineMtCO2e - actualMtCO2e;
            const totalReductionNeeded = baselineMtCO2e - targetMtCO2e;
            const progressPct = totalReductionNeeded > 0
                ? Math.min(100, (reductionFromBaseline / totalReductionNeeded) * 100)
                : 100;

            const remainingTarget = actualMtCO2e - targetMtCO2e;
            const onTrack = actualMtCO2e <= targetMtCO2e;

            // Trend: compare against prior-year target using SBT pathway
            const priorYearTarget = baselineMtCO2e * Math.pow(1 - this.SBT_ANNUAL_REDUCTION_PCT / 100, year - (target?.baselineYear || year));
            const trend: 'IMPROVING' | 'WORSENING' | 'FLAT' =
                actualMtCO2e < priorYearTarget * 0.98 ? 'IMPROVING' :
                    actualMtCO2e > priorYearTarget * 1.02 ? 'WORSENING' : 'FLAT';

            return { scope, baselineMtCO2e, targetMtCO2e, actualMtCO2e, remainingTarget, progressPct: Number(progressPct.toFixed(1)), onTrack, trend };
        });

        const totalTargetMtCO2e = scopeReports.reduce((s, r) => s + r.targetMtCO2e, 0);
        const totalActualMtCO2e = scopeReports.reduce((s, r) => s + r.actualMtCO2e, 0);
        const totalBaseline = scopeReports.reduce((s, r) => s + r.baselineMtCO2e, 0);
        const netReductionFromBaseline = totalBaseline - totalActualMtCO2e;
        const netReductionPct = totalBaseline > 0 ? (netReductionFromBaseline / totalBaseline) * 100 : 0;

        // Science-based target: ≥4.2% annual reduction = aligned
        const requiredReductionPct = this.SBT_ANNUAL_REDUCTION_PCT;
        const scienceBasedTargetAligned = netReductionPct >= requiredReductionPct;

        this.logger.log(`ESG Carbon Report ${year}: Total actual=${totalActualMtCO2e.toFixed(1)} MtCO2e, net reduction=${netReductionPct.toFixed(1)}%, SBT aligned=${scienceBasedTargetAligned}`);

        return {
            tenantId, year,
            reportDate: new Date(),
            scopes: scopeReports,
            totalTargetMtCO2e: Number(totalTargetMtCO2e.toFixed(2)),
            totalActualMtCO2e: Number(totalActualMtCO2e.toFixed(2)),
            netReductionFromBaseline: Number(netReductionFromBaseline.toFixed(2)),
            netReductionPct: Number(netReductionPct.toFixed(2)),
            scienceBasedTargetAligned,
        };
    }

    /**
     * Returns Scope 3 breakdown by GHG Protocol category.
     */
    getScope3Breakdown(tenantId: string, year: number): Array<{
        category: Scope3Category;
        actualMtCO2e: number;
        targetMtCO2e?: number;
        pctOfTotal: number;
    }> {
        const scope3Actuals = Array.from(this.actuals.values())
            .filter(a => a.tenantId === tenantId && a.year === year && a.scope === 'SCOPE_3' && a.scope3Category);
        const scope3Targets = Array.from(this.targets.values())
            .filter(t => t.tenantId === tenantId && t.year === year && t.scope === 'SCOPE_3' && t.scope3Category);

        const totalScope3 = scope3Actuals.reduce((s, a) => s + a.actualMtCO2e, 0);

        const categoryMap = new Map<Scope3Category, number>();
        for (const actual of scope3Actuals) {
            const key = actual.scope3Category as Scope3Category;
            categoryMap.set(key, (categoryMap.get(key) || 0) + actual.actualMtCO2e);
        }

        return Array.from(categoryMap.entries()).map(([category, actualMtCO2e]) => {
            const target = scope3Targets.find(t => t.scope3Category === category);
            return {
                category,
                actualMtCO2e: Number(actualMtCO2e.toFixed(3)),
                targetMtCO2e: target?.targetMtCO2e,
                pctOfTotal: totalScope3 > 0 ? Number(((actualMtCO2e / totalScope3) * 100).toFixed(1)) : 0,
            };
        }).sort((a, b) => b.actualMtCO2e - a.actualMtCO2e);
    }

    // ── DEI Targets ───────────────────────────────────────────────────────────
    setDeiTarget(input: Omit<DeiTarget, 'id'>): DeiTarget {
        const id = `DEI-${input.dimension}-${input.year}-${Date.now()}`;
        const target: DeiTarget = { id, ...input };
        this.deiTargets.set(id, target);
        this.logger.log(`DEI target set: ${input.dimension} ${input.year} = ${input.targetValue}${input.targetUnit}`);
        return target;
    }

    updateDeiActual(targetId: string, currentValue: number): DeiTarget {
        const target = this.deiTargets.get(targetId);
        if (!target) throw new NotFoundException(`DEI target ${targetId} not found`);
        target.currentValue = currentValue;
        return target;
    }

    getDeiProgress(tenantId: string, year: number): Array<{
        dimension: string;
        targetValue: number;
        currentValue?: number;
        progressPct: number;
        onTrack: boolean;
    }> {
        return Array.from(this.deiTargets.values())
            .filter(t => t.tenantId === tenantId && t.year === year)
            .map(t => ({
                dimension: t.dimension,
                targetValue: t.targetValue,
                currentValue: t.currentValue,
                progressPct: t.currentValue != null && t.targetValue > 0
                    ? Number(Math.min(100, (t.currentValue / t.targetValue) * 100).toFixed(1))
                    : 0,
                onTrack: t.currentValue != null && t.currentValue >= t.targetValue * 0.9,
            }));
    }
}
