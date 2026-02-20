import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { hrmTimeRules } from '@shared/schema/time_rules';

export interface TimeRuleSimulationInput {
    startTime: string;      // e.g. "09:30"
    endTime: string;        // e.g. "21:00"
    dayOfWeek: string;      // e.g. "Sat"
    baseHourlyRate: number; // e.g. 25.00
}

export interface TimeRuleSimulationResult {
    applicableRules: Array<{
        ruleId: string;
        name: string;
        ruleType: string;
        effectiveMultiplier: number;
        flatRateAdd: number;
        effectivePay: number;
    }>;
    totalHours: number;
    grossPay: number;
    effectiveHourlyRate: number;
}

@Injectable()
export class TimeRuleService {
    constructor(
        @Inject('DATABASE') private db: NodePgDatabase<Record<string, unknown>>,
    ) { }

    async findAll(tenantId: string): Promise<any[]> {
        return this.db
            .select()
            .from(hrmTimeRules)
            .where(eq(hrmTimeRules.tenantId, tenantId));
    }

    async findById(id: string): Promise<any> {
        const [rule] = await this.db
            .select()
            .from(hrmTimeRules)
            .where(eq(hrmTimeRules.id, id));
        if (!rule) throw new NotFoundException(`Time rule ${id} not found`);
        return rule;
    }

    async create(data: any): Promise<any> {
        const [rule] = await this.db
            .insert(hrmTimeRules)
            .values(data)
            .returning();
        return rule;
    }

    async update(id: string, data: any): Promise<any> {
        const [rule] = await this.db
            .update(hrmTimeRules)
            .set(data)
            .where(eq(hrmTimeRules.id, id))
            .returning();
        if (!rule) throw new NotFoundException(`Time rule ${id} not found`);
        return rule;
    }

    async delete(id: string): Promise<{ success: boolean }> {
        await this.db
            .delete(hrmTimeRules)
            .where(eq(hrmTimeRules.id, id));
        return { success: true };
    }

    async toggleStatus(id: string): Promise<any> {
        const rule = await this.findById(id);
        const newStatus = rule.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const [updated] = await this.db
            .update(hrmTimeRules)
            .set({ status: newStatus })
            .where(eq(hrmTimeRules.id, id))
            .returning();
        return updated;
    }

    /**
     * Rule Simulation Mode:
     * Given a shift scenario (startTime, endTime, dayOfWeek, baseRate),
     * returns which rules would apply and what the effective pay would be.
     */
    async simulateRules(
        tenantId: string,
        input: TimeRuleSimulationInput,
    ): Promise<TimeRuleSimulationResult> {
        const allRules = await this.db
            .select()
            .from(hrmTimeRules)
            .where(and(
                eq(hrmTimeRules.tenantId, tenantId),
                eq(hrmTimeRules.status, 'ACTIVE'),
            ));

        const [startH, startM] = input.startTime.split(':').map(Number);
        const [endH, endM] = input.endTime.split(':').map(Number);
        const totalHours = ((endH * 60 + endM) - (startH * 60 + startM)) / 60;

        const applicableRules: TimeRuleSimulationResult['applicableRules'] = [];

        for (const rule of allRules) {
            let applies = false;

            // Check day of week condition
            if (rule.daysOfWeek) {
                const days = rule.daysOfWeek.split(',').map((d: string) => d.trim());
                if (days.includes(input.dayOfWeek)) applies = true;
            }

            // Check time window condition (e.g., Night Shift: 18:00-06:00)
            if (!applies && rule.startTime && rule.endTime) {
                const [rStartH, rStartM] = rule.startTime.split(':').map(Number);
                const [rEndH, rEndM] = rule.endTime.split(':').map(Number);
                const rStartMins = rStartH * 60 + rStartM;
                const rEndMins = rEndH * 60 + rEndM;
                const inputStartMins = startH * 60 + startM;
                const inputEndMins = endH * 60 + endM;

                // Overlapping windows (handle overnight rules like 22:00-06:00)
                if (rStartMins > rEndMins) {
                    // Overnight rule
                    if (inputStartMins >= rStartMins || inputEndMins <= rEndMins) applies = true;
                } else {
                    if (inputStartMins < rEndMins && inputEndMins > rStartMins) applies = true;
                }
            }

            if (applies) {
                const multiplier = Number(rule.multiplier ?? 1);
                const flatAdd = Number(rule.flatRateAdd ?? 0);
                const effectiveRate = input.baseHourlyRate * multiplier + flatAdd;
                applicableRules.push({
                    ruleId: rule.id,
                    name: rule.name,
                    ruleType: rule.ruleType,
                    effectiveMultiplier: multiplier,
                    flatRateAdd: flatAdd,
                    effectivePay: effectiveRate * totalHours,
                });
            }
        }

        // Use highest-value rule if multiple apply (standard labor law treatment)
        const bestRule = applicableRules.reduce<TimeRuleSimulationResult['applicableRules'][0] | null>(
            (best, r) => (!best || r.effectivePay > best.effectivePay ? r : best),
            null,
        );

        const grossPay = bestRule
            ? bestRule.effectivePay
            : input.baseHourlyRate * totalHours;

        const effectiveHourlyRate = totalHours > 0 ? grossPay / totalHours : input.baseHourlyRate;

        return {
            applicableRules,
            totalHours: Math.round(totalHours * 100) / 100,
            grossPay: Math.round(grossPay * 100) / 100,
            effectiveHourlyRate: Math.round(effectiveHourlyRate * 100) / 100,
        };
    }
}
