import { supabase } from '@/lib/db';

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

        // Calculate individual factor scores (0-100)
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
        const { data, error } = await supabase
            .from('customer_health_scores')
            .insert({
                customer_id: customerId,
                health_score,
                trend,
                risk_level,
                factors,
                last_engagement: engagementMetrics.last_engagement,
                last_login: engagementMetrics.last_login,
                days_since_last_activity: engagementMetrics.days_since_last_activity,
                calculated_at: new Date()
            })
            .select()
            .single();

        if (error) throw error;

        // Check if playbooks should be triggered
        await this.checkPlaybookTriggers(customerId, data);

        return data;
    }

    /**
     * Get customer health history
     */
    static async getHealthHistory(customerId: string, days: number = 90): Promise<CustomerHealthScore[]> {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const { data, error } = await supabase
            .from('customer_health_scores')
            .select('*')
            .eq('customer_id', customerId)
            .gte('calculated_at', since.toISOString())
            .order('calculated_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Get all at-risk customers
     */
    static async getAtRiskCustomers(riskLevel: string[] = ['high', 'critical']): Promise<CustomerHealthScore[]> {
        const { data, error } = await supabase
            .from('customer_health_scores')
            .select(`
        *,
        customers (
          id,
          name,
          email,
          arr
        )
      `)
            .in('risk_level', riskLevel)
            .order('health_score', { ascending: true });

        if (error) throw error;
        return data;
    }

    // =====================================================
    // Playbook Management
    // =====================================================

    /**
     * Execute a playbook for a customer
     */
    static async executePlaybook(playbookId: string, customerId: string): Promise<void> {
        const { data: playbook, error } = await supabase
            .from('cs_playbooks')
            .select('*')
            .eq('id', playbookId)
            .single();

        if (error || !playbook) throw new Error('Playbook not found');

        let actionsCompleted = 0;
        let actionsFailed = 0;
        const executionLog: any[] = [];

        // Execute each action
        for (const action of playbook.actions) {
            try {
                await this.executeAction(action, customerId);
                actionsCompleted++;
                executionLog.push({ action, status: 'success', timestamp: new Date() });
            } catch (error) {
                actionsFailed++;
                executionLog.push({ action, status: 'failed', error: (error as Error).message, timestamp: new Date() });
            }
        }

        // Log execution
        await supabase.from('playbook_executions').insert({
            playbook_id: playbookId,
            customer_id: customerId,
            execution_status: actionsFailed > 0 ? 'partial' : 'success',
            actions_completed: actionsCompleted,
            actions_failed: actionsFailed,
            execution_log: executionLog
        });

        // Update playbook stats
        await supabase
            .from('cs_playbooks')
            .update({
                execution_count: playbook.execution_count + 1,
                last_executed_at: new Date()
            })
            .eq('id', playbookId);
    }

    /**
     * Check if any playbooks should be triggered
     */
    static async checkPlaybookTriggers(customerId: string, healthScore: CustomerHealthScore): Promise<void> {
        const { data: playbooks } = await supabase
            .from('cs_playbooks')
            .select('*')
            .eq('is_active', true);

        if (!playbooks) return;

        for (const playbook of playbooks) {
            if (this.shouldTriggerPlaybook(playbook, healthScore)) {
                await this.executePlaybook(playbook.id, customerId);
            }
        }
    }

    /**
     * Determine if playbook should trigger based on conditions
     */
    private static shouldTriggerPlaybook(playbook: CSPlaybook, healthScore: CustomerHealthScore): boolean {
        const conditions = playbook.trigger_conditions;

        switch (playbook.trigger_type) {
            case 'health_decline':
                return healthScore.health_score < (conditions.health_score_below || 60) &&
                    healthScore.trend === 'declining';

            case 'churn_risk':
                return healthScore.risk_level === 'high' || healthScore.risk_level === 'critical';

            default:
                return false;
        }
    }

    // =====================================================
    // Touchpoint Management
    // =====================================================

    /**
     * Create a customer touchpoint
     */
    static async createTouchpoint(touchpoint: Partial<CustomerTouchpoint>): Promise<CustomerTouchpoint> {
        const { data, error } = await supabase
            .from('customer_touchpoints')
            .insert(touchpoint)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Get touchpoint history for a customer
     */
    static async getTouchpointHistory(customerId: string, limit: number = 50): Promise<CustomerTouchpoint[]> {
        const { data, error } = await supabase
            .from('customer_touchpoints')
            .select('*')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }

    /**
     * Get upcoming follow-up actions
     */
    static async getUpcomingActions(csmUserId?: string): Promise<CustomerTouchpoint[]> {
        let query = supabase
            .from('customer_touchpoints')
            .select(`
        *,
        customers (
          id,
          name,
          email
        )
      `)
            .not('next_action_date', 'is', null)
            .eq('is_completed', false)
            .order('next_action_date', { ascending: true });

        if (csmUserId) {
            query = query.or(`csm_user_id.eq.${csmUserId},next_action_owner.eq.${csmUserId}`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    // =====================================================
    // Renewal Forecasting
    // =====================================================

    /**
     * Get renewal risk report
     */
    static async getRenewalRiskReport(daysAhead: number = 90): Promise<RenewalForecast[]> {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysAhead);

        const { data, error } = await supabase
            .from('renewal_forecasts')
            .select(`
        *,
        customers (
          id,
          name,
          email,
          arr
        )
      `)
            .lte('renewal_date', futureDate.toISOString())
            .order('churn_risk', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Update renewal forecast
     */
    static async updateRenewalForecast(customerId: string, forecast: Partial<RenewalForecast>): Promise<RenewalForecast> {
        const { data, error } = await supabase
            .from('renewal_forecasts')
            .upsert({
                customer_id: customerId,
                ...forecast,
                forecast_date: new Date()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
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
        const history = await this.getHealthHistory(customerId, 30);

        if (history.length < 2) return 'stable';

        const previousScore = history[1]?.health_score || currentScore;
        const diff = currentScore - previousScore;

        if (diff > 5) return 'improving';
        if (diff < -5) return 'declining';
        if (diff < -15) return 'critical';
        return 'stable';
    }

    private static async getUsageMetrics(customerId: string): Promise<any> {
        // This would integrate with usage analytics service
        // For now, return mock data
        return {
            score: 70,
            feature_adoption_percentage: 65
        };
    }

    private static async getSupportMetrics(customerId: string): Promise<any> {
        // This would integrate with support/CRM service
        return {
            open_tickets: 2
        };
    }

    private static async getPaymentMetrics(customerId: string): Promise<any> {
        // This would integrate with billing service
        return {
            on_time_percentage: 95
        };
    }

    private static async getEngagementMetrics(customerId: string): Promise<any> {
        // This would query touchpoints and login data
        return {
            last_engagement: new Date(),
            last_login: new Date(),
            days_since_last_activity: 3,
            nps_score: 75
        };
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
