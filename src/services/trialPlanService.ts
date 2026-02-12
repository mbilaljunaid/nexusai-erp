import { supabase } from '@/lib/supabase';

export class TrialManagementService {

    static async createTrial(signupData: any): Promise<any> {
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + (signupData.trial_duration_days || 14));

        const { data, error } = await supabase
            .from('trial_signups')
            .insert({
                ...signupData,
                trial_end_date: trialEndDate,
                status: 'active'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async getActiveTrials(): Promise<any[]> {
        const { data, error } = await supabase
            .from('trial_signups')
            .select('*')
            .eq('status', 'active')
            .order('trial_started_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    static async convertTrial(trialId: string, planId: string): Promise<void> {
        const now = new Date();
        const { data: trial } = await supabase
            .from('trial_signups')
            .select('trial_started_at')
            .eq('id', trialId)
            .single();

        const daysToConversion = trial
            ? Math.floor((now.getTime() - new Date(trial.trial_started_at).getTime()) / (1000 * 60 * 60 * 24))
            : 0;

        await supabase
            .from('trial_signups')
            .update({
                status: 'converted',
                converted_at: now,
                conversion_plan_id: planId,
                days_to_conversion: daysToConversion
            })
            .eq('id', trialId);
    }

    static async getConversionMetrics(days: number = 30): Promise<any> {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const { data } = await supabase
            .from('trial_signups')
            .select('status, days_to_conversion, activation_score')
            .gte('trial_started_at', since.toISOString());

        const total = data?.length || 0;
        const converted = data?.filter(t => t.status === 'converted').length || 0;
        const avgDaysToConvert = converted > 0
            ? data?.filter(t => t.status === 'converted')
                .reduce((sum, t) => sum + (t.days_to_conversion || 0), 0) / converted
            : 0;

        return {
            total_trials: total,
            conversions: converted,
            conversion_rate: total > 0 ? (converted / total) * 100 : 0,
            avg_days_to_convert: Math.round(avgDaysToConvert)
        };
    }
}

export class PlanManagementService {

    static async getActivePlans(): Promise<any[]> {
        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .eq('is_public', true)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data;
    }

    static async checkFeatureAccess(customerId: string, featureCode: string): Promise<boolean> {
        const { data, error } = await supabase
            .rpc('has_feature_access', {
                p_customer_id: customerId,
                p_feature_code: featureCode
            });

        if (error) throw error;
        return data || false;
    }

    static async getCustomerUsage(customerId: string): Promise<any> {
        const { data } = await supabase
            .from('customer_plan_usage')
            .select('*')
            .eq('customer_id', customerId)
            .order('period_start', { ascending: false })
            .limit(1)
            .single();

        return data;
    }

    static async changePlan(customerId: string, newPlanId: string, changeType: string): Promise<void> {
        // Get current subscription
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*, subscription_plans(*)')
            .eq('customer_id', customerId)
            .eq('status', 'active')
            .single();

        if (!subscription) throw new Error('No active subscription');

        // Get new plan
        const { data: newPlan } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', newPlanId)
            .single();

        if (!newPlan) throw new Error('Plan not found');

        // Record change
        await supabase
            .from('plan_change_history')
            .insert({
                customer_id: customerId,
                subscription_id: subscription.id,
                previous_plan_id: subscription.plan_id,
                new_plan_id: newPlanId,
                change_type: changeType,
                previous_mrr: subscription.subscription_plans.price_monthly,
                new_mrr: newPlan.price_monthly,
                mrr_delta: newPlan.price_monthly - subscription.subscription_plans.price_monthly,
                effective_date: new Date()
            });

        // Update subscription
        await supabase
            .from('subscriptions')
            .update({ plan_id: newPlanId })
            .eq('id', subscription.id);
    }
}

export default { TrialManagementService, PlanManagementService };
