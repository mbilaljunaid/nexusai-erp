
/**
 * Customer Success Platform Service
 * Handles customer health tracking, playbooks, touchpoints, and renewal forecasting
 */

// =====================================================
// Types & Interfaces
// =====================================================

export interface CustomerHealthScore {
    id: string;
    tenant_id: string;
    customer_id: string;
    health_score: number;
    trend: 'improving' | 'stable' | 'declining' | 'critical';
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    factors: HealthFactors;
    last_engagement?: Date;
    last_login?: Date;
    days_since_last_activity?: number;
    calculated_at: Date;
}

export interface HealthFactors {
    usage_score?: number;
    support_tickets_score?: number;
    nps_score?: number;
    feature_adoption_score?: number;
    payment_history_score?: number;
}

export interface CSPlaybook {
    id: string;
    tenant_id: string;
    name: string;
    description?: string;
    trigger_type: 'health_decline' | 'milestone' | 'renewal' | 'onboarding' | 'expansion_opportunity' | 'churn_risk' | 'usage_threshold';
    trigger_conditions: Record<string, any>;
    actions: PlaybookAction[];
    priority: number;
    is_active: boolean;
    execution_count: number;
    last_executed_at?: Date;
}

export interface PlaybookAction {
    type: 'email' | 'task' | 'notification' | 'webhook';
    template_id?: string;
    assigned_to?: string;
    description?: string;
    message?: string;
    delay_days?: number;
    priority?: 'low' | 'medium' | 'high';
}

export interface CustomerTouchpoint {
    id: string;
    tenant_id: string;
    customer_id: string;
    csm_user_id?: string;
    touchpoint_type: 'call' | 'email' | 'meeting' | 'qbr' | 'check_in' | 'training' | 'escalation' | 'renewal_discussion' | 'expansion_discussion';
    subject?: string;
    description?: string;
    sentiment?: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
    sentiment_score?: number;
    next_action?: string;
    next_action_date?: Date;
    next_action_owner?: string;
    duration_minutes?: number;
    attendees?: string[];
    attachments?: any[];
    tags?: string[];
    is_completed: boolean;
    completed_at?: Date;
    created_at: Date;
}

export interface RenewalForecast {
    id: string;
    tenant_id: string;
    customer_id: string;
    renewal_date: Date;
    current_arr: number;
    forecasted_arr?: number;
    renewal_probability: number;
    expansion_probability: number;
    churn_risk: number;
    risk_factors?: Record<string, any>;
    mitigation_plan?: string;
    csm_confidence?: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
}

export interface CustomerGoal {
    id: string;
    tenant_id: string;
    customer_id: string;
    goal_name: string;
    goal_description?: string;
    goal_type: 'business_outcome' | 'adoption' | 'usage' | 'satisfaction';
    target_metric?: string;
    target_value?: number;
    current_value?: number;
    start_date?: Date;
    target_date?: Date;
    status: 'not_started' | 'on_track' | 'at_risk' | 'achieved' | 'missed';
    progress_percentage: number;
    owner_user_id?: string;
}

// =====================================================
// Health Score Management
// =====================================================

export class CustomerSuccessService {

    /**
     * Calculate health score for a customer based on multiple factors
     */
    static async getUsageMetrics(customerId: string): Promise<any> { return { score: 85, feature_adoption_percentage: 60 }; }
    static async getSupportMetrics(customerId: string): Promise<any> { return { open_tickets: 2 }; }
    static async getPaymentMetrics(customerId: string): Promise<any> { return { on_time_percentage: 100 }; }
    static async getEngagementMetrics(customerId: string): Promise<any> { return { nps_score: 80 }; }

    static async calculateHealthScore(customerId: string): Promise<CustomerHealthScore> {
        // Get various metrics for health calculation
        const [
            usageMetrics,
            supportMetrics,
            paymentMetrics,
            engagementMetrics
        ] = await Promise.all([
            this.getUsageMetrics(customerId),
            this.getSupportMetrics(customerId),
            this.getPaymentMetrics(customerId),
            this.getEngagementMetrics(customerId)
        ]);

        // Calculated individual factor scores (0-100)
        const factors: HealthFactors = {
            usage_score: usageMetrics.score,
            support_tickets_score: 100 - (supportMetrics.open_tickets * 10), // More tickets = lower score
            payment_history_score: paymentMetrics.on_time_percentage,
            feature_adoption_score: usageMetrics.feature_adoption_percentage,
            nps_score: engagementMetrics.nps_score || 50
        };

        // Weighted average for overall health score
        const weights = {
            usage_score: 0.3,
            support_tickets_score: 0.2,
            payment_history_score: 0.2,
            feature_adoption_score: 0.2,
            nps_score: 0.1
        };

        const health_score = Math.round(
            (factors.usage_score || 0) * weights.usage_score +
            (factors.support_tickets_score || 0) * weights.support_tickets_score +
            (factors.payment_history_score || 0) * weights.payment_history_score +
            (factors.feature_adoption_score || 0) * weights.feature_adoption_score +
            (factors.nps_score || 0) * weights.nps_score
        );

        // Determine risk level and trend
        const risk_level = this.calculateRiskLevel(health_score);
        const trend = await this.calculateTrend(customerId, health_score);

        // Save to database
        const response = await fetch(`/api/mock-${Math.random()}`);
        if (!response.ok) throw new Error("Failed");
        return response.json();
    }

    /**
     * Get all at-risk customers
     */
    static async getAtRiskCustomers(riskLevel: string[] = ['high', 'critical']): Promise<CustomerHealthScore[]> {
        const response = await fetch(`/api/mock-${Math.random()}`);
        if (!response.ok) throw new Error("Failed");
        return response.json();
    }

    // =====================================================
    // Playbook Management
    // =====================================================

    /**
     * Execute a playbook for a customer
     */
    static async executePlaybook(playbookId: string, customerId: string): Promise<void> {
        const response = await fetch(`/api/mock-${Math.random()}`);
        const data = await response.json();

        let actionsCompleted = 0;
        let actionsFailed = 0;
        const executionLog: any[] = [];

        // Execute each action
        for (const action of (data?.actions || [])) {
            try {
                // Mock action
                actionsCompleted++;
                executionLog.push({ action, status: 'success', timestamp: new Date() });
            } catch (error) {
                actionsFailed++;
                executionLog.push({ action, status: 'failed', error: (error as Error).message, timestamp: new Date() });
            }
        }

        // Log execution
        await fetch(`/api/mock-${Math.random()}`, { method: "POST" });

        // Update playbook stats
        await fetch(`/api/mock-${Math.random()}`, { method: "POST" });
    }

    /**
     * Check if any playbooks should be triggered
     */
    static async checkPlaybookTriggers(customerId: string, healthScore: CustomerHealthScore): Promise<void> {
        const response = await fetch(`/api/mock-${Math.random()}`);
        return response.json();
    }

    // =====================================================
    // Helper Methods
    // =====================================================

    private static calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
        if (score >= 80) return 'low';
        if (score >= 60) return 'medium';
        if (score >= 40) return 'high';
        return 'critical';
    }

    private static async calculateTrend(customerId: string, currentScore: number): Promise<string> {
        // mock logic since db removed
        return 'stable';
    }



    static async getHealthHistory(customerId: string, daysStr: number): Promise<any[]> {
        return [];
    }

    static async getRenewalRiskReport(daysStr: number): Promise<any[]> {
        return [];
    }

    private static async executeAction(action: PlaybookAction, customerId: string): Promise<void> {
        switch (action.type) {
            case 'email':
                // Send email via notification service
                console.log(`Sending email to customer ${customerId}`);
                break;

            case 'task':
                // Create task in task management system
                console.log(`Creating task for customer ${customerId}`);
                break;

            case 'notification':
                // Send in-app notification
                console.log(`Sending notification for customer ${customerId}`);
                break;

            default:
                throw new Error(`Unknown action type: ${action.type}`);
        }
    }
}

export default CustomerSuccessService;
