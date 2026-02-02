import { TimeLaborService } from "./TimeLaborService";
import { ManagerAnalyticsService } from "./ManagerAnalyticsService";

export class AIQueryService {
    /**
     * processQuery
     * Simple deterministic router for HR queries (V1).
     * In a production Tier-1 system, this would use LLM tool-calling.
     */
    static async processQuery(query: string, personId: string, tenantId: string) {
        const q = query.toLowerCase();

        // 1. Leave Balance Queries
        if (q.includes("leave") || q.includes("balance") || q.includes("vacation") || q.includes("sick")) {
            const balances = await TimeLaborService.getLeaveBalances(tenantId, personId);
            if (balances.length === 0) return "You have no active leave balances currently.";

            const balanceSummary = balances.map(b => `${b.balance} ${b.balanceUnit} of ${b.leaveType}`).join(", ");
            return `Your current leave balances are: ${balanceSummary}.`;
        }

        // 2. Time Card / Timesheet Queries
        if (q.includes("time") || q.includes("hours") || q.includes("timesheet") || q.includes("worked")) {
            const periods = await TimeLaborService.getTimePeriods(tenantId);
            if (periods.length === 0) return "I couldn't find any open time periods.";

            const currentPeriod = periods[0];
            const sheet = await TimeLaborService.getOrCreateTimesheet(tenantId, personId, currentPeriod.id);
            return `You are currently in the period '${currentPeriod.name}'. Your timesheet status is '${sheet.status || 'DRAFT'}'.`;
        }

        // 3. Team Analytics (For Managers)
        if (q.includes("team") || q.includes("attrition") || q.includes("skill") || q.includes("performance")) {
            const stats = await ManagerAnalyticsService.getTeamMetrics(personId, tenantId); // Assuming managerId = personId for this call
            return `Your team has ${stats.headCount} members. The average performance rating is ${stats.averageRating}/5.0, and the attrition risk is ${stats.attritionRisk}.`;
        }

        return "I'm sorry, I couldn't find a specific answer for your HR query. Try asking about your leave balance or your team's performance.";
    }

    /**
     * getQuickNudges
     * Returns personal context-aware nudges for the AIGuide sidebar.
     */
    static async getQuickNudges(personId: string, tenantId: string) {
        return [
            { id: "n1", text: "Submit your week's timesheet by Friday", type: "reminder" },
            { id: "n2", text: "New benefit enrollment period starts soon", type: "info" }
        ];
    }
}
