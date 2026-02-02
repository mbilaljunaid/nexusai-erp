
import { db } from "../db";
import { eq, and, or, gte, lte } from "drizzle-orm";
import { hrmTimeRules, hrmAccrualPolicies } from "@shared/schema/time_rules";
import { hrmTimeEntries } from "@shared/schema/time_labor";

export class TimeRuleEngine {

    // Evaluate a single time entry against active rules
    static async applyPremiums(tenantId: string, entryId: string) {
        // 1. Fetch Entry
        const [entry] = await db.select().from(hrmTimeEntries).where(eq(hrmTimeEntries.id, entryId));
        if (!entry || !entry.startTime || !entry.endTime) return;

        // 2. Fetch Active Rules
        const rules = await db.select().from(hrmTimeRules)
            .where(and(
                eq(hrmTimeRules.tenantId, tenantId),
                eq(hrmTimeRules.status, 'ACTIVE')
            ));

        let totalPremium = 0;
        const entryStart = new Date(entry.startTime);
        const entryEnd = new Date(entry.endTime);
        const entryStartHour = entryStart.getHours();

        // 3. Evaluate Rules
        for (const rule of rules) {
            // Check Rule Type: DIFFERENTIAL (e.g., Night Shift)
            if (rule.ruleType === 'DIFFERENTIAL') {
                // Simplified Time Window Check
                // e.g., Rule Start 18:00, End 06:00
                // For V1, we just check if the shift START is within the window to apply flat rate for whole duration
                // Real world: split duration.

                if (rule.startTime && rule.endTime) {
                    const ruleStartH = parseInt(rule.startTime.split(':')[0]);
                    // Logic: If Entry starts >= Rule Start
                    if (entryStartHour >= ruleStartH) {
                        if (rule.flatRateAdd) {
                            const add = Number(rule.flatRateAdd);
                            const hours = entry.durationMinutes / 60;
                            const premium = add * hours;
                            totalPremium += premium;
                            console.log(`[RULE APPLIED] ${rule.name}: +$${premium.toFixed(2)}`);
                        }
                    }
                }
            }

            // Check Rule Type: PREMIUM (e.g., Weekend)
            if (rule.ruleType === 'PREMIUM' && rule.multiplier) {
                const day = entryStart.getDay(); // 0 = Sun, 6 = Sat
                // Check if daysOfWeek matches (e.g., "0,6")
                if (rule.daysOfWeek && rule.daysOfWeek.includes(String(day))) {
                    // Need base rate to calculate multiplier value.
                    // For now, we store the multiplier factor or calculated amount if we had rate.
                    // We will just log this as "Eligible for Premium" or calculate simpler flat add equivalent if needed.
                    // To match "Premium Pay" requirement, let's assume a base rate of $20 for calculation if not present.
                    const baseRate = 20;
                    const multiplier = Number(rule.multiplier);
                    const extraRate = baseRate * (multiplier - 1); // 1.5x -> 0.5x extra
                    const hours = entry.durationMinutes / 60;
                    const premium = extraRate * hours;
                    totalPremium += premium;
                    console.log(`[RULE APPLIED] ${rule.name}: ${multiplier}x Multiplier (+$${premium.toFixed(2)})`);
                }
            }
        }

        return totalPremium; // This would typically satisfy "Premium Pay" GL line.
    }

    // Calculate Accrual for a Person based on Tenure
    static async calculateAccrual(tenantId: string, personId: string, tenureMonths: number) {
        // 1. Fetch Active Policies
        // Order by minTenure desc to find best match first
        const policies = await db.select().from(hrmAccrualPolicies)
            .where(and(
                eq(hrmAccrualPolicies.tenantId, tenantId),
                eq(hrmAccrualPolicies.status, 'ACTIVE')
            ));

        // 2. Find eligible policy (Highest tenure requirement met)
        // e.g. T=60 (5yr). Policies: 0->10d, 60->15d. Match 60.

        let bestPolicy = null;
        let maxMinTenure = -1;

        for (const pol of policies) {
            const min = pol.minTenureMonths || 0;
            if (tenureMonths >= min && min > maxMinTenure) {
                maxMinTenure = min;
                bestPolicy = pol;
            }
        }

        if (bestPolicy) {
            console.log(`[ACCRUAL] Matched Policy: ${bestPolicy.name} (Rate: ${bestPolicy.accrualRatePerYear} days/yr)`);
            return {
                leaveType: bestPolicy.leaveType,
                dailyAccrual: bestPolicy.accrualRatePerYear / 365,
                maxCap: bestPolicy.maxCapDays
            };
        }

        return null;
    }
}
