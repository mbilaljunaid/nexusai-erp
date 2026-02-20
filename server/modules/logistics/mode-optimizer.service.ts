import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * ModeOptimizerService — TMS-OG-03
 *
 * Transportation mode optimization engine.
 * Evaluates TL / LTL / Parcel / Intermodal / Air options based on:
 * - Weight + pallet count thresholds per mode
 * - Distance-based cost estimation
 * - Transit day requirements
 * - Carbon footprint (CO2 kg per mode)
 * - Composite score = weighted(cost, transit, carbon)
 *
 * In production, this would call a carrier rating API (e.g. SMC³, Zeta).
 * This implementation uses a rule-based cost model.
 */

interface ModeProfile {
    mode: string;
    baseRate: number;         // $/lb
    minWeight: number;
    maxWeight: number;
    transitDaysBase: number;
    co2PerLb: number;         // kg CO2 per lb
    distanceFactor: number;   // rate multiplier per 100 miles
}

const MODE_PROFILES: ModeProfile[] = [
    { mode: 'PARCEL', baseRate: 0.08, minWeight: 0, maxWeight: 150, transitDaysBase: 1, co2PerLb: 0.15, distanceFactor: 0.02 },
    { mode: 'LTL', baseRate: 0.04, minWeight: 151, maxWeight: 9999, transitDaysBase: 3, co2PerLb: 0.09, distanceFactor: 0.015 },
    { mode: 'TL', baseRate: 0.019, minWeight: 10000, maxWeight: 48000, transitDaysBase: 2, co2PerLb: 0.07, distanceFactor: 0.011 },
    { mode: 'INTERMODAL', baseRate: 0.014, minWeight: 10000, maxWeight: 48000, transitDaysBase: 5, co2PerLb: 0.04, distanceFactor: 0.009 },
    { mode: 'AIR', baseRate: 0.45, minWeight: 0, maxWeight: 10000, transitDaysBase: 1, co2PerLb: 0.60, distanceFactor: 0.001 },
];

// Approximate distance proxy from zip prefix difference (real impl uses a zip-distance API)
function estimateDistance(originZip: string, destZip: string): number {
    const originPrefix = parseInt(originZip.slice(0, 3)) || 0;
    const destPrefix = parseInt(destZip.slice(0, 3)) || 0;
    return Math.abs(originPrefix - destPrefix) * 8 + 100;  // rough miles estimation
}

export class ModeOptimizerService {

    async optimizeMode(params: {
        tenantId: string;
        originZip: string;
        destZip: string;
        weightLbs: number;
        palletCount?: number;
        pickupDate?: string;
        requiredTransitDays?: number;
        costWeight?: number;      // 0-1 weighting for cost in score (default 0.5)
        transitWeight?: number;   // 0-1 weighting for transit (default 0.3)
        carbonWeight?: number;    // 0-1 weighting for carbon (default 0.2)
        runBy?: string;
    }) {
        const distanceMiles = estimateDistance(params.originZip, params.destZip);
        const weight = params.weightLbs;
        const cw = params.costWeight ?? 0.5;
        const tw = params.transitWeight ?? 0.3;
        const ew = params.carbonWeight ?? 0.2;

        // Evaluate each mode
        const eligibleModes = MODE_PROFILES.filter(
            m => weight >= m.minWeight && weight <= m.maxWeight
        );

        const costs: { mode: string; cost: number; transitDays: number; co2Kg: number }[] = [];
        for (const m of eligibleModes) {
            const cost = weight * m.baseRate + (distanceMiles / 100) * m.distanceFactor * weight;
            const transitDays = m.transitDaysBase + Math.floor(distanceMiles / 500);
            const co2Kg = weight * m.co2PerLb;
            costs.push({ mode: m.mode, cost, transitDays, co2Kg });
        }

        if (costs.length === 0) throw new Error('No eligible mode for given weight and parameters');

        // Filter by required transit if specified
        const filtered = params.requiredTransitDays
            ? costs.filter(c => c.transitDays <= params.requiredTransitDays!)
            : costs;
        const candidates = filtered.length > 0 ? filtered : costs;

        // Normalize and score
        const maxCost = Math.max(...candidates.map(c => c.cost));
        const maxTransit = Math.max(...candidates.map(c => c.transitDays));
        const maxCO2 = Math.max(...candidates.map(c => c.co2Kg));

        const scored = candidates.map(c => ({
            ...c,
            score: 1 - (
                cw * (c.cost / maxCost) +
                tw * (c.transitDays / maxTransit) +
                ew * (c.co2Kg / maxCO2)
            ),
        })).sort((a, b) => b.score - a.score);

        const recommended = scored[0];

        // Persist run
        const [run] = (await db.execute(sql`
            INSERT INTO mode_optimization_runs (
                tenant_id, origin_zip, dest_zip, weight_lbs, pallet_count,
                pickup_date, required_transit_days, options_evaluated,
                recommended_mode, estimated_cost, estimated_transit_days, run_by
            ) VALUES (
                ${params.tenantId}, ${params.originZip}, ${params.destZip}, ${params.weightLbs},
                ${params.palletCount ?? null}, ${params.pickupDate ?? null}, ${params.requiredTransitDays ?? null},
                ${scored.length}, ${recommended.mode}, ${recommended.cost}, ${recommended.transitDays},
                ${params.runBy ?? 'system'}
            ) RETURNING *
        `)) as any;

        // Persist options
        for (const opt of scored) {
            await db.execute(sql`
                INSERT INTO mode_options (run_id, mode, estimated_cost, transit_days, co2_kg, score, recommended)
                VALUES (${run.id}, ${opt.mode}, ${opt.cost}, ${opt.transitDays}, ${opt.co2Kg}, ${opt.score}, ${opt.mode === recommended.mode})
            `);
        }

        return {
            run,
            recommended,
            options: scored,
            distanceMiles,
        };
    }

    async listRuns(tenantId: string, limit = 50) {
        return (await db.execute(sql`
            SELECT * FROM mode_optimization_runs
            WHERE tenant_id = ${tenantId}
            ORDER BY run_at DESC LIMIT ${limit}
        `) as any).rows;
    }

    async getRunOptions(runId: string) {
        return (await db.execute(sql`
            SELECT * FROM mode_options WHERE run_id = ${runId} ORDER BY score DESC
        `) as any).rows;
    }

    async getDefaultModes() {
        return MODE_PROFILES.map(m => ({
            mode: m.mode,
            minWeightLbs: m.minWeight,
            maxWeightLbs: m.maxWeight,
            baseRatePerLb: m.baseRate,
            baseTransitDays: m.transitDaysBase,
            co2PerLbKg: m.co2PerLb,
        }));
    }
}

export const modeOptimizerService = new ModeOptimizerService();
