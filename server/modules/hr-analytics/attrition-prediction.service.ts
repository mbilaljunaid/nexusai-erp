import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * AttritionPredictionService — HR-OG-03
 * Scores employees for flight risk using a rule-based heuristic engine
 * (production would call a Python/ML model; this implements the deterministic scoring layer).
 */
export class AttritionPredictionService {

    private scoreEmployee(features: {
        tenureMonths: number; engagementScore: number; lastPromotionDays: number;
        managerTenureMonths: number; compaRatio: number; recentAbsenceDays: number;
        overdueGoals: number;
    }): { score: number; band: string; factors: any[] } {
        let score = 0;
        const factors: any[] = [];

        // Tenure — J-curve: high attrition at <12m and >84m
        if (features.tenureMonths < 12) { score += 0.25; factors.push({ factor: 'Low tenure', value: features.tenureMonths + 'mo', direction: 'up', weight: 0.25 }); }
        else if (features.tenureMonths > 84) { score += 0.15; factors.push({ factor: 'Long tenure (stagnation risk)', value: features.tenureMonths + 'mo', direction: 'up', weight: 0.15 }); }

        // Engagement
        if (features.engagementScore < 2.5) { score += 0.30; factors.push({ factor: 'Very low engagement', value: features.engagementScore, direction: 'up', weight: 0.30 }); }
        else if (features.engagementScore < 3.5) { score += 0.15; factors.push({ factor: 'Below-average engagement', value: features.engagementScore, direction: 'up', weight: 0.15 }); }

        // Time since last promotion
        if (features.lastPromotionDays > 730) { score += 0.20; factors.push({ factor: 'No promotion in >2 years', value: features.lastPromotionDays + 'd', direction: 'up', weight: 0.20 }); }
        else if (features.lastPromotionDays > 365) { score += 0.08; factors.push({ factor: 'No promotion in >1 year', value: features.lastPromotionDays + 'd', direction: 'up', weight: 0.08 }); }

        // Manager instability
        if (features.managerTenureMonths < 6) { score += 0.10; factors.push({ factor: 'New manager (<6mo)', value: features.managerTenureMonths + 'mo', direction: 'up', weight: 0.10 }); }

        // Below-market pay
        if (features.compaRatio < 0.85) { score += 0.25; factors.push({ factor: 'Below-market compensation', value: features.compaRatio.toFixed(2), direction: 'up', weight: 0.25 }); }
        else if (features.compaRatio < 0.95) { score += 0.10; factors.push({ factor: 'Slightly below market comp', value: features.compaRatio.toFixed(2), direction: 'up', weight: 0.10 }); }

        // Absences
        if (features.recentAbsenceDays > 10) { score += 0.15; factors.push({ factor: 'High recent absences', value: features.recentAbsenceDays + 'd', direction: 'up', weight: 0.15 }); }

        // Overdue goals
        if (features.overdueGoals >= 3) { score += 0.10; factors.push({ factor: 'Multiple overdue goals', value: features.overdueGoals, direction: 'up', weight: 0.10 }); }

        const clampedScore = Math.min(0.99, score);
        const band = clampedScore >= 0.75 ? 'CRITICAL' : clampedScore >= 0.50 ? 'HIGH' : clampedScore >= 0.25 ? 'MEDIUM' : 'LOW';

        return { score: Number(clampedScore.toFixed(4)), band, factors };
    }

    async scoreAndSave(params: {
        tenantId: string; employeeId: string;
        tenureMonths: number; engagementScore: number; lastPromotionDays: number;
        managerTenureMonths: number; compaRatio: number; recentAbsenceDays: number;
        overdueGoals: number;
    }) {
        const { score, band, factors } = this.scoreEmployee(params);
        const [r] = (await db.execute(sql`
            INSERT INTO attrition_risk_scores (
                tenant_id, employee_id, risk_score, risk_band, top_factors,
                tenure_months, engagement_score, last_promotion_days,
                manager_tenure_months, compa_ratio, recent_absence_days, overdue_goals
            ) VALUES (
                ${params.tenantId}, ${params.employeeId}, ${score}, ${band},
                ${JSON.stringify(factors)}::jsonb,
                ${params.tenureMonths}, ${params.engagementScore}, ${params.lastPromotionDays},
                ${params.managerTenureMonths}, ${params.compaRatio},
                ${params.recentAbsenceDays}, ${params.overdueGoals}
            ) RETURNING *
        `)) as any;
        return r;
    }

    async getHighRiskEmployees(tenantId: string, band?: string, limit = 50) {
        let q = sql`SELECT * FROM attrition_risk_scores WHERE tenant_id = ${tenantId}`;
        if (band) q = sql`${q} AND risk_band = ${band}`;
        q = sql`${q} ORDER BY risk_score DESC, scored_at DESC LIMIT ${limit}`;
        return (await db.execute(q) as any).rows;
    }

    async getRiskDistribution(tenantId: string) {
        return (await db.execute(sql`
            SELECT risk_band, COUNT(*) AS count, ROUND(AVG(risk_score)::numeric, 3) AS avg_score
            FROM attrition_risk_scores WHERE tenant_id = ${tenantId}
            GROUP BY risk_band ORDER BY MIN(risk_score) DESC
        `) as any).rows;
    }

    async getEmployeeHistory(tenantId: string, employeeId: string) {
        return (await db.execute(sql`
            SELECT * FROM attrition_risk_scores
            WHERE tenant_id = ${tenantId} AND employee_id = ${employeeId}
            ORDER BY scored_at DESC LIMIT 12
        `) as any).rows;
    }
}

export const attritionPredictionService = new AttritionPredictionService();
