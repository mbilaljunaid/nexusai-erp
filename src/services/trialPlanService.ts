// Import removed: was using mocked supabase

export class TrialManagementService {

    static async createTrial(signupData: any): Promise<any> {
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + (signupData.trial_duration_days || 14));

        const response = await fetch('/api/billing/trials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...signupData,
                trial_end_date: trialEndDate,
                status: 'active'
            })
        });

        if (!response.ok) throw new Error('Failed to create trial');
        return response.json();
    }

    static async getActiveTrials(): Promise<any[]> {
        const response = await fetch('/api/billing/trials/active');
        if (!response.ok) throw new Error('Failed to fetch trials');
        return response.json();
    }

    static async convertTrial(trialId: string, planId: string): Promise<void> {
        const now = new Date();
        const response = await fetch(`/api/billing/trials/${trialId}/convert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId, timestamp: now })
        });
        if (!response.ok) throw new Error('Failed to convert trial');
    }

    static async getConversionMetrics(days: number = 30): Promise<any> {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const response = await fetch(`/api/billing/trials/metrics?days=${days}`);
        if (!response.ok) throw new Error('Failed to fetch metrics');
        return response.json();
    }
}

export class PlanManagementService {

    static async getActivePlans(): Promise<any[]> {
        const response = await fetch('/api/billing/plans/active');
        if (!response.ok) throw new Error('Failed to fetch active plans');
        return response.json();
    }

    static async checkFeatureAccess(customerId: string, featureCode: string): Promise<boolean> {
        const response = await fetch(`/api/billing/customers/${customerId}/features/${featureCode}/access`);
        if (!response.ok) return false;
        const data = await response.json();
        return data.hasAccess || false;
    }

    static async getCustomerUsage(customerId: string): Promise<any> {
        const response = await fetch(`/api/billing/customers/${customerId}/usage`);
        if (!response.ok) return null;
        return response.json();
    }

    static async changePlan(customerId: string, newPlanId: string, changeType: string): Promise<void> {
        const response = await fetch(`/api/billing/customers/${customerId}/plan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPlanId, changeType })
        });
        if (!response.ok) throw new Error('Failed to change plan');
    }
}

export default { TrialManagementService, PlanManagementService };
