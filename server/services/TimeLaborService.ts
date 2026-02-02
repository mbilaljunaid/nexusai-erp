
import { db } from "@db";
import {
    hrmTimePeriods, hrmTimeSheets, hrmTimeEntries, hrmShifts, hrmShiftAssignments, hrmPayrollBatches,
    hrmLaborPolicies, hrmTimeViolations, hrmLeaveBalances, hrmAccrualPolicies, hrmPublicHolidays, hrmRegionalPolicies,
    WfmTimeEntry, WfmTimeSheet
} from "@shared/schema/time_labor";
import { hrPersons } from "@shared/schema/hr_worker";
import { eq, and, inArray, desc, sql } from "drizzle-orm";

import { TimeRuleEngine } from "./TimeRuleEngine";

export class TimeLaborService {

    // 1. TIME PERIODS
    static async createTimePeriod(tenantId: string, name: string, startDate: string, endDate: string) {
        const [period] = await db.insert(hrmTimePeriods).values({
            tenantId,
            name,
            startDate,
            endDate,
            status: "OPEN"
        }).returning();
        return period;
    }

    static async getOpenPeriods(tenantId: string) {
        return await db.select().from(hrmTimePeriods)
            .where(and(eq(hrmTimePeriods.tenantId, tenantId), eq(hrmTimePeriods.status, "OPEN")));
    }

    // 2. TIMESHEETS
    static async getOrCreateTimesheet(tenantId: string, personId: string, periodId: string) {
        // Check existence
        const [existing] = await db.select().from(hrmTimeSheets)
            .where(and(
                eq(hrmTimeSheets.personId, personId),
                eq(hrmTimeSheets.periodId, periodId)
            ));

        if (existing) return existing;

        // Create new
        const [newSheet] = await db.insert(hrmTimeSheets).values({
            tenantId,
            personId,
            periodId,
            status: "DRAFT"
        }).returning();

        return newSheet;
    }

    static async getTimesheet(timesheetId: string) {
        const [sheet] = await db.select().from(hrmTimeSheets).where(eq(hrmTimeSheets.id, timesheetId));
        if (!sheet) throw new Error("Timesheet not found");

        const entries = await db.select().from(hrmTimeEntries).where(eq(hrmTimeEntries.timesheetId, timesheetId));

        return { ...sheet, entries };
    }

    // 3. TIME ENTRIES
    static async logTime(payload: {
        tenantId: string;
        timesheetId: string;
        date: string;
        startTime?: string;
        endTime?: string;
        durationMinutes: number;
        timeType?: string;
        notes?: string;
    }) {
        // Insert Entry
        const [entry] = await db.insert(hrmTimeEntries).values({
            tenantId: payload.tenantId,
            timesheetId: payload.timesheetId,
            date: payload.date,
            startTime: payload.startTime ? new Date(payload.startTime) : null,
            endTime: payload.endTime ? new Date(payload.endTime) : null,
            durationMinutes: payload.durationMinutes,
            timeType: payload.timeType || "REGULAR",
            notes: payload.notes
        }).returning();

        // Recalculate Totals (Basic)
        await this.recalcTimesheetTotals(payload.timesheetId);

        // Check for Violations
        // Need PersonId
        const [sheet] = await db.select().from(hrmTimeSheets).where(eq(hrmTimeSheets.id, payload.timesheetId));
        if (sheet && entry.startTime) {
            await this.checkViolations(payload.tenantId, entry.id, sheet.personId, payload.date, entry.startTime, entry.endTime);
            // NEW: Apply Premium Rules
            await TimeRuleEngine.applyPremiums(payload.tenantId, entry.id);
        }

        return entry;
    }

    static async recalcTimesheetTotals(timesheetId: string) {
        const entries = await db.select().from(hrmTimeEntries).where(eq(hrmTimeEntries.timesheetId, timesheetId));
        const [sheet] = await db.select().from(hrmTimeSheets).where(eq(hrmTimeSheets.id, timesheetId));

        // 1. Calculate Gross Total
        let totalMins = 0;
        entries.forEach(e => totalMins += e.durationMinutes);
        const totalHours = Number((totalMins / 60).toFixed(2));

        // 2. Fetch Person to get Country (Now available)
        const [person] = await db.select().from(hrPersons).where(eq(hrPersons.id, sheet.personId));
        const countryCode = person?.country || "US"; // Default to US if missing

        // 3. Fetch Policy
        const [policy] = await db.select().from(hrmRegionalPolicies).where(eq(hrmRegionalPolicies.countryCode, countryCode));
        const standardWeeklyHours = policy ? Number(policy.standardWeeklyHours) : 40.0;

        // 4. Calculate OT
        // Logic: If Total > Standard -> Excess is OT.
        // NOTE: This overrides manual "OVERTIME" logging mostly, or we can trust manual if present?
        // Requirement says "Regional Overtime Rules". Automated calculation is better.
        // We will reset `totalOvertime` based on this rule.

        let otHours = 0;
        if (totalHours > standardWeeklyHours) {
            otHours = totalHours - standardWeeklyHours;
        }

        await db.update(hrmTimeSheets)
            .set({
                totalHours: totalHours.toString(),
                totalOvertime: otHours.toFixed(2),
                updatedAt: new Date()
            })
            .where(eq(hrmTimeSheets.id, timesheetId));
    }

    // 4. SHIFTS
    static async createShift(tenantId: string, data: typeof hrmShifts.$inferInsert) {
        const [shift] = await db.insert(hrmShifts).values({ ...data, tenantId }).returning();
        return shift;
    }

    static async getShifts(tenantId: string) {
        return await db.select().from(hrmShifts).where(eq(hrmShifts.tenantId, tenantId));
    }

    static async assignShift(tenantId: string, personId: string, shiftId: string, date: string) {
        // V1: Upsert (Replace existing shift on that day)
        // Check if exists
        const [existing] = await db.select().from(hrmShiftAssignments)
            .where(and(
                eq(hrmShiftAssignments.tenantId, tenantId),
                eq(hrmShiftAssignments.personId, personId),
                eq(hrmShiftAssignments.date, date)
            ));

        if (existing) {
            const [updated] = await db.update(hrmShiftAssignments)
                .set({ shiftId, isPublished: true })
                .where(eq(hrmShiftAssignments.id, existing.id))
                .returning();
            return updated;
        } else {
            const [assignment] = await db.insert(hrmShiftAssignments).values({
                tenantId,
                personId,
                shiftId,
                date,
                isPublished: true
            }).returning();
            return assignment;
        }
    }

    static async getSchedule(tenantId: string, personId: string, fromDate: string, toDate: string) {
        // Returning simple list, filtered by Person
        return await db.select({
            assignment: hrmShiftAssignments,
            shift: hrmShifts
        })
            .from(hrmShiftAssignments)
            .innerJoin(hrmShifts, eq(hrmShiftAssignments.shiftId, hrmShifts.id))
            .where(eq(hrmShiftAssignments.personId, personId));
    }

    static async getTeamSchedule(tenantId: string) {
        // V1: Return ALL assignments (simulating small team)
        return await db.select({
            assignment: hrmShiftAssignments,
            shift: hrmShifts,
            person: hrPersons
        })
            .from(hrmShiftAssignments)
            .innerJoin(hrmShifts, eq(hrmShiftAssignments.shiftId, hrmShifts.id))
            .innerJoin(hrPersons, eq(hrmShiftAssignments.personId, hrPersons.id))
            .where(eq(hrmShiftAssignments.tenantId, tenantId));
    }
    // 5. APPROVAL WORKFLOW
    static async submitTimesheet(timesheetId: string) {
        // Validation: Verify total hours > 0
        const [sheet] = await db.select().from(hrmTimeSheets).where(eq(hrmTimeSheets.id, timesheetId));
        if (!sheet) throw new Error("Timesheet not found");

        // Simple V1 validation
        if (Number(sheet.totalHours) === 0) throw new Error("Cannot submit empty timesheet");

        const [updated] = await db.update(hrmTimeSheets)
            .set({
                status: "SUBMITTED",
                submissionDate: new Date(),
                updatedAt: new Date()
            })
            .where(eq(hrmTimeSheets.id, timesheetId))
            .returning();

        return updated;
    }

    static async approveTimesheet(timesheetId: string, approverId: string) {
        const [updated] = await db.update(hrmTimeSheets)
            .set({
                status: "APPROVED",
                approverId,
                approvedAt: new Date(),
                updatedAt: new Date()
            })
            .where(eq(hrmTimeSheets.id, timesheetId))
            .returning();
        return updated;
    }

    static async rejectTimesheet(timesheetId: string, reason?: string) {
        // Reason not stored in V1 schema yet, but logic exists
        const [updated] = await db.update(hrmTimeSheets)
            .set({
                status: "REJECTED",
                updatedAt: new Date()
            })
            .where(eq(hrmTimeSheets.id, timesheetId))
            .returning();
        return updated;
    }

    static async getPendingTimesheets(tenantId: string) {
        // In real app, filter by Approver ID matches Manager
        // V1: All SUBMITTED sheets for tenant
        return await db.select({
            timesheet: hrmTimeSheets,
            person: hrPersons,
            period: hrmTimePeriods
        })
            .from(hrmTimeSheets)
            .innerJoin(hrPersons, eq(hrmTimeSheets.personId, hrPersons.id))
            .innerJoin(hrmTimePeriods, eq(hrmTimeSheets.periodId, hrmTimePeriods.id))
            .where(and(
                eq(hrmTimeSheets.tenantId, tenantId),
                eq(hrmTimeSheets.status, "SUBMITTED")
            ));
    }

    // 6. PAYROLL INTEGRATION
    static async transferToPayroll(tenantId: string, periodId: string, userId: string) {
        // 1. Find APPROVED sheets
        const approvedSheets = await db.select({
            id: hrmTimeSheets.id,
            personId: hrmTimeSheets.personId,
            totalHours: hrmTimeSheets.totalHours,
            totalOvertime: hrmTimeSheets.totalOvertime
        })
            .from(hrmTimeSheets)
            .where(and(
                eq(hrmTimeSheets.tenantId, tenantId),
                eq(hrmTimeSheets.periodId, periodId),
                eq(hrmTimeSheets.status, "APPROVED")
            ));

        if (approvedSheets.length === 0) {
            return { message: "No approved timesheets found for this period." };
        }

        // 2. Generate Payload (Aggregation)
        const payload = approvedSheets.map(sheet => ({
            personId: sheet.personId,
            earnings: [
                { type: "REGULAR", hours: Number(sheet.totalHours) - Number(sheet.totalOvertime) },
                { type: "OVERTIME", hours: Number(sheet.totalOvertime) }
            ]
        }));

        // 3. Create Batch
        const [batch] = await db.insert(hrmPayrollBatches).values({
            tenantId,
            periodId,
            runBy: userId,
            totalRecords: approvedSheets.length,
            status: "COMPLETED",
            payload: payload
        }).returning();

        // 4. Update Sheets to TRANSFERRED
        await db.update(hrmTimeSheets)
            .set({ status: "TRANSFERRED", updatedAt: new Date() })
            .where(inArray(hrmTimeSheets.id, approvedSheets.map(s => s.id)));

        return batch;
    }

    static async getPayrollBatches(tenantId: string) {
        return await db.select({
            batch: hrmPayrollBatches,
            period: hrmTimePeriods
        })
            .from(hrmPayrollBatches)
            .innerJoin(hrmTimePeriods, eq(hrmPayrollBatches.periodId, hrmTimePeriods.id))
            .where(eq(hrmPayrollBatches.tenantId, tenantId))
            .orderBy(desc(hrmPayrollBatches.runDate));
    }

    // 7. TIMEKEEPER & BULK ENTRY
    static async getDailyStatus(tenantId: string, date: string) {
        // 1. Get All Persons (V1: All in Tenant)
        const persons = await db.select().from(hrPersons).where(eq(hrPersons.tenantId, tenantId));

        // 2. Get Shifts for this day
        const shifts = await db.select().from(hrmShiftAssignments)
            .where(and(
                eq(hrmShiftAssignments.tenantId, tenantId),
                eq(hrmShiftAssignments.date, date)
            ));

        // 3. Get Time Entries for this day
        // Need to join Sheet -> Entry
        const entries = await db.select({
            entry: hrmTimeEntries,
            personId: hrmTimeSheets.personId
        })
            .from(hrmTimeEntries)
            .innerJoin(hrmTimeSheets, eq(hrmTimeEntries.timesheetId, hrmTimeSheets.id))
            .where(and(
                eq(hrmTimeSheets.tenantId, tenantId),
                eq(hrmTimeEntries.date, date)
            ));

        // 4. Combine
        return persons.map(p => {
            const shift = shifts.find(s => s.personId === p.id);
            const entry = entries.find(e => e.personId === p.id); // Assuming 1 entry/day for simplification here, or take first

            // Format Time Helper
            const fmtTime = (d: Date | null) => {
                if (!d) return "";
                // Use Local Time to match Entry Input context (assuming single timezone for V1)
                return d.toTimeString().substring(0, 5);
            };

            return {
                person: p,
                shiftId: shift?.shiftId,
                startTime: entry?.entry.startTime ? fmtTime(entry.entry.startTime) : "",
                endTime: entry?.entry.endTime ? fmtTime(entry.entry.endTime) : "",
                hours: entry?.entry.durationMinutes ? (entry.entry.durationMinutes / 60).toFixed(2) : 0
            };
        });
    }

    static async bulkUpsertEntries(tenantId: string, date: string, entries: any[]) {
        // entries: [{ personId, startTime, endTime }]
        // 1. Find Period for Date
        const periods = await this.getOpenPeriods(tenantId);
        const period = periods.find(p => date >= p.startDate && date <= p.endDate);
        if (!period) throw new Error(`No open period found for ${date}`);

        const results = [];
        for (const entry of entries) {
            try {
                // A. Ensure Timesheet
                let [sheet] = await db.select().from(hrmTimeSheets).where(and(
                    eq(hrmTimeSheets.personId, entry.personId),
                    eq(hrmTimeSheets.periodId, period.id)
                ));

                if (!sheet) {
                    [sheet] = await db.insert(hrmTimeSheets).values({
                        tenantId,
                        personId: entry.personId,
                        periodId: period.id,
                        status: "DRAFT",
                        totalHours: "0",
                        totalOvertime: "0"
                    }).returning();
                }

                // B. Calculate Duration
                // Simple V1: Parse HH:mm
                const start = new Date(`${date}T${entry.startTime}`);
                const end = new Date(`${date}T${entry.endTime}`);
                const diffMs = end.getTime() - start.getTime();
                const durationMinutes = diffMs > 0 ? diffMs / (1000 * 60) : 0;

                // C. Log Time
                // Note: date string vs Date object for logTime payload
                // logTime expects Date object for start/end in payload? 
                // Looking at logTime source: 
                // startTime: payload.startTime ? new Date(payload.startTime) : null
                // So string is fine if it parses. 

                const result = await this.logTime({
                    tenantId,
                    timesheetId: sheet.id,
                    date: date,
                    startTime: `${date}T${entry.startTime}:00`,
                    endTime: `${date}T${entry.endTime}:00`,
                    durationMinutes,
                    timeType: "REGULAR", // V1 Default
                    notes: "Bulk Entry"
                });

                results.push({ personId: entry.personId, status: "SUCCESS", id: result.id });
            } catch (e: any) {
                results.push({ personId: entry.personId, status: "ERROR", error: e.message });
            }
        }
        return results;
    }

    // 8. RULES & VIOLATIONS
    static async checkViolations(tenantId: string, entryId: string, personId: string, date: string, startTime: Date | null, endTime: Date | null) {
        if (!startTime || !endTime) return; // Can't check open ended yet

        // 1. Get Policy (V1: Default)
        const [policy] = await db.select().from(hrmLaborPolicies).where(eq(hrmLaborPolicies.tenantId, tenantId)).limit(1);
        const grace = policy?.gracePeriodMinutes || 15;

        // 2. Get Shift
        const [assignment] = await db.select({
            startTime: hrmShifts.startTime,
            endTime: hrmShifts.endTime
        })
            .from(hrmShiftAssignments)
            .innerJoin(hrmShifts, eq(hrmShiftAssignments.shiftId, hrmShifts.id))
            .where(and(
                eq(hrmShiftAssignments.personId, personId),
                eq(hrmShiftAssignments.date, date)
            ));

        if (!assignment) return; // Worked on off-day (could flag this too, but skipping for V1)

        // 3. Compare LATE IN
        // Parse Shift Start (HH:mm) to Date on same day
        const shiftStart = new Date(`${date}T${assignment.startTime}:00`); // Local/ISO mix risk, but acceptable if system consistent
        const effectiveStart = new Date(shiftStart.getTime() + grace * 60000);

        // Adjust for timezone differences if stored startTime includes Date component
        // entry.startTime is Date object from DB/Payload.
        // If entry.startTime > shiftStart + grace

        // Simpler: Compare HH:mm strings if dates match? 
        // Or comparing timestamps.
        // Assuming entry date matches `date`.

        // To be safe with "Time" comparison, let's compare Minutes from Midnight.
        const getMins = (d: Date) => d.getHours() * 60 + d.getMinutes();
        const shiftStartMins = parseInt(assignment.startTime.split(':')[0]) * 60 + parseInt(assignment.startTime.split(':')[1]);
        const entryStartMins = getMins(startTime);

        if (entryStartMins > shiftStartMins + grace) {
            await db.insert(hrmTimeViolations).values({
                tenantId,
                entryId,
                type: "LATE_IN",
                severity: "LOW",
                message: `Started at ${startTime.toTimeString().substring(0, 5)}, expected ${assignment.startTime} (Grace: ${grace}m)`
            });
        }

        // 4. Compare EARLY OUT
        const shiftEndMins = parseInt(assignment.endTime.split(':')[0]) * 60 + parseInt(assignment.endTime.split(':')[1]);
        const entryEndMins = getMins(endTime);

        if (entryEndMins < shiftEndMins - grace) {
            await db.insert(hrmTimeViolations).values({
                tenantId,
                entryId,
                type: "EARLY_OUT",
                severity: "LOW",
                message: `Left at ${endTime.toTimeString().substring(0, 5)}, expected ${assignment.endTime}`
            });
        }
    }

    static async getViolations(tenantId: string) {
        return await db.select({
            violation: hrmTimeViolations,
            entry: hrmTimeEntries,
            person: hrPersons
        })
            .from(hrmTimeViolations)
            .innerJoin(hrmTimeEntries, eq(hrmTimeViolations.entryId, hrmTimeEntries.id))
            .innerJoin(hrmTimeSheets, eq(hrmTimeEntries.timesheetId, hrmTimeSheets.id))
            .innerJoin(hrPersons, eq(hrmTimeSheets.personId, hrPersons.id))
            .where(eq(hrmTimeViolations.tenantId, tenantId))
            .orderBy(desc(hrmTimeViolations.createdAt));
    }

    // 9. ANALYTICS
    static async getLaborMetrics(tenantId: string, startDate: string, endDate: string) {
        // 1. Actual Hours
        const entries = await db.select().from(hrmTimeEntries)
            .innerJoin(hrmTimeSheets, eq(hrmTimeEntries.timesheetId, hrmTimeSheets.id))
            .where(and(
                eq(hrmTimeSheets.tenantId, tenantId),
                sql`${hrmTimeEntries.date} >= ${startDate}`,
                sql`${hrmTimeEntries.date} <= ${endDate}`
            ));

        let totalActualMinutes = 0;
        let totalOvertimeMinutes = 0;
        const dailyActual: Record<string, number> = {};

        entries.forEach(({ hrm_time_entries: e }) => {
            totalActualMinutes += e.durationMinutes;
            if (e.timeType === 'OVERTIME') totalOvertimeMinutes += e.durationMinutes;

            // Daily Aggregation
            const dateStr = e.date as string;
            dailyActual[dateStr] = (dailyActual[dateStr] || 0) + e.durationMinutes;
        });

        // 2. Scheduled Hours
        const assignments = await db.select({
            startTime: hrmShifts.startTime,
            endTime: hrmShifts.endTime,
            date: hrmShiftAssignments.date
        })
            .from(hrmShiftAssignments)
            .innerJoin(hrmShifts, eq(hrmShiftAssignments.shiftId, hrmShifts.id))
            .where(and(
                eq(hrmShiftAssignments.tenantId, tenantId),
                sql`${hrmShiftAssignments.date} >= ${startDate}`,
                sql`${hrmShiftAssignments.date} <= ${endDate}`
            ));

        let totalScheduledMinutes = 0;
        const dailyScheduled: Record<string, number> = {};

        assignments.forEach(a => {
            // Simple Parse
            const startMins = parseInt(a.startTime.split(':')[0]) * 60 + parseInt(a.startTime.split(':')[1]);
            const endMins = parseInt(a.endTime.split(':')[0]) * 60 + parseInt(a.endTime.split(':')[1]);
            const duration = endMins - startMins; // assume no overnight shifts for V1 logic simplifiction

            if (duration > 0) {
                totalScheduledMinutes += duration;

                const dateStr = a.date as string;
                dailyScheduled[dateStr] = (dailyScheduled[dateStr] || 0) + duration;
            }
        });

        // 3. Violations
        const violations = await db.select({ count: sql<number>`count(*)` })
            .from(hrmTimeViolations)
            .where(eq(hrmTimeViolations.tenantId, tenantId));
        // Should verify violation date, but violations are linked to entries. 
        // For V1 simple count total is fine, or join.
        // Let's just return total violations for now or 0 if filtering hard.

        // 4. Chart Data
        // Union Dates
        const allDates = Array.from(new Set([...Object.keys(dailyActual), ...Object.keys(dailyScheduled)])).sort();
        const chartData = allDates.map(date => ({
            date,
            actual: Number(((dailyActual[date] || 0) / 60).toFixed(2)),
            scheduled: Number(((dailyScheduled[date] || 0) / 60).toFixed(2))
        }));

        const totalActualHours = Number((totalActualMinutes / 60).toFixed(2));
        const totalScheduledHours = Number((totalScheduledMinutes / 60).toFixed(2));

        // Mock Costing
        const estimatedCost = totalActualHours * 50;

        return {
            totalActualHours,
            totalScheduledHours,
            totalOvertimeHours: Number((totalOvertimeMinutes / 60).toFixed(2)),
            utilization: totalScheduledHours > 0 ? Math.round((totalActualHours / totalScheduledHours) * 100) : 0,
            violationsCount: Number(violations[0]?.count || 0),
            estimatedCost,
            chartData
        };
    }

    // 10. ACCRUALS (Leave Balances)
    static async getLeaveBalances(tenantId: string, personId: string) {
        return await db.select().from(hrmLeaveBalances).where(and(eq(hrmLeaveBalances.tenantId, tenantId), eq(hrmLeaveBalances.personId, personId)));
    }

    static async addAccrual(tenantId: string, personId: string, leaveType: string, hours: number) {
        // Check if balance exists
        const [existing] = await db.select().from(hrmLeaveBalances).where(and(
            eq(hrmLeaveBalances.tenantId, tenantId),
            eq(hrmLeaveBalances.personId, personId),
            eq(hrmLeaveBalances.leaveType, leaveType)
        ));

        if (existing) {
            const newBalance = Number(existing.balanceHours) + hours;
            const [updated] = await db.update(hrmLeaveBalances)
                .set({ balanceHours: newBalance.toString(), lastAccrualDate: new Date().toISOString() })
                .where(eq(hrmLeaveBalances.id, existing.id))
                .returning();
            return updated;
        } else {
            const [created] = await db.insert(hrmLeaveBalances).values({
                tenantId,
                personId,
                leaveType,
                balanceHours: hours.toString(),
                lastAccrualDate: new Date().toISOString()
            }).returning();
            return created;
        }
    }

    static async deductLeave(tenantId: string, personId: string, leaveType: string, hours: number) {
        // For V1 simpler logic: Allow negative balance if no sufficient funds (or block it in UI)
        // Here we just subtract
        const [existing] = await db.select().from(hrmLeaveBalances).where(and(
            eq(hrmLeaveBalances.tenantId, tenantId),
            eq(hrmLeaveBalances.personId, personId),
            eq(hrmLeaveBalances.leaveType, leaveType)
        ));

        if (existing) {
            const newBalance = Number(existing.balanceHours) - hours;
            const [updated] = await db.update(hrmLeaveBalances)
                .set({ balanceHours: newBalance.toString() })
                .where(eq(hrmLeaveBalances.id, existing.id))
                .returning();
            return updated;
        }
        // If no balance record, maybe start with negative? Or ignore. 
        // Let's create one with negative balance to track debt.
        const [created] = await db.insert(hrmLeaveBalances).values({
            tenantId,
            personId,
            leaveType,
            balanceHours: (-hours).toString()
        }).returning();
        return created;
    }

    // 11. ACCRUAL ENGINE (Batch Cycle)
    static async runAccrualCycle(tenantId: string) {
        // 1. Fetch all policies
        const policies = await db.select().from(hrmAccrualPolicies).where(eq(hrmAccrualPolicies.tenantId, tenantId));
        if (policies.length === 0) return { message: "No policies found", processed: 0 };

        // 2. Fetch all active persons (Simplified: All persons for now)
        // In real app, filter by active assignment status
        const persons = await db.select().from(hrPersons).where(eq(hrPersons.tenantId, tenantId));

        let processedCount = 0;
        const now = new Date();

        for (const person of persons) {
            // Tenure Calculation (Proxy: CreatedAt)
            // In real app, use WorkRelationship.startDate
            const hireDate = new Date(person.createdAt || now);
            const tenureMonths = (now.getFullYear() - hireDate.getFullYear()) * 12 + (now.getMonth() - hireDate.getMonth());

            for (const policy of policies) {
                // RULE 1: Vesting Check
                if (policy.vestingMonths && tenureMonths < policy.vestingMonths) {
                    continue; // Skip if not vested
                }

                // RULE 2: Get Current Balance
                const [existing] = await db.select().from(hrmLeaveBalances).where(and(
                    eq(hrmLeaveBalances.tenantId, tenantId),
                    eq(hrmLeaveBalances.personId, person.id),
                    eq(hrmLeaveBalances.leaveType, policy.leaveType)
                ));

                const currentBalance = existing ? Number(existing.balanceHours) : 0;
                let newBalance = currentBalance + Number(policy.accrualRate);

                // RULE 3: Max Cap Check
                if (policy.maxCap && newBalance > Number(policy.maxCap)) {
                    newBalance = Number(policy.maxCap);
                }

                // UPDATE or INSERT
                if (existing) {
                    await db.update(hrmLeaveBalances)
                        .set({ balanceHours: newBalance.toString(), lastAccrualDate: now.toISOString() })
                        .where(eq(hrmLeaveBalances.id, existing.id));
                } else {
                    await db.insert(hrmLeaveBalances).values({
                        tenantId,
                        personId: person.id,
                        leaveType: policy.leaveType,
                        balanceHours: newBalance.toString(),
                        lastAccrualDate: now.toISOString()
                    });
                }
                processedCount++;
            }
        }
        return { message: "Accrual Cycle Complete", processed: processedCount };
    }

    // 12. LOCALIZATION (Holidays)
    static async getHolidays(tenantId: string, countryCode?: string) {
        let query = db.select().from(hrmPublicHolidays).where(eq(hrmPublicHolidays.tenantId, tenantId));
        if (countryCode) {
            query = db.select().from(hrmPublicHolidays).where(and(
                eq(hrmPublicHolidays.tenantId, tenantId),
                eq(hrmPublicHolidays.countryCode, countryCode)
            ));
        }
        return await query;
    }

    static async createHoliday(tenantId: string, date: string, name: string, countryCode: string) {
        // Upsert logic could be added, here simple insert
        const [holiday] = await db.insert(hrmPublicHolidays).values({
            tenantId,
            date,
            name,
            countryCode,
            isMandatory: true
        }).returning();
        return holiday;
    }

    static async checkHolidayWarning(tenantId: string, date: string, countryCode: string = "US"): Promise<string | null> {
        // Helper to check if a date is a holiday
        const [holiday] = await db.select().from(hrmPublicHolidays).where(and(
            eq(hrmPublicHolidays.tenantId, tenantId),
            eq(hrmPublicHolidays.date, date),
            eq(hrmPublicHolidays.countryCode, countryCode)
        ));

        if (holiday) {
            return `Warning: ${date} is ${holiday.name}`;
        }
        return null;
    }


    // 13. REGIONAL RULES (Overtime)
    static async configureRegionalPolicy(tenantId: string, countryCode: string, standardWeeklyHours: number, standardDailyHours: number, overtimeMultiplier: number) {
        // Upsert
        const [existing] = await db.select().from(hrmRegionalPolicies).where(eq(hrmRegionalPolicies.countryCode, countryCode));

        if (existing) {
            const [updated] = await db.update(hrmRegionalPolicies).set({
                tenantId, // Ensure tenant ownership matches
                standardWeeklyHours: standardWeeklyHours.toString(),
                standardDailyHours: standardDailyHours.toString(),
                overtimeMultiplier: overtimeMultiplier.toString(),
                updatedAt: new Date()
            }).where(eq(hrmRegionalPolicies.countryCode, countryCode)).returning();
            return updated;
        } else {
            const [created] = await db.insert(hrmRegionalPolicies).values({
                tenantId,
                countryCode,
                standardWeeklyHours: standardWeeklyHours.toString(),
                standardDailyHours: standardDailyHours.toString(),
                overtimeMultiplier: overtimeMultiplier.toString()
            }).returning();
            return created;
        }
    }
}
