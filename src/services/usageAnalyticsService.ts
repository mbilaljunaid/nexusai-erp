import { supabase } from '@/lib/db';

/**
 * Usage Analytics Service
 * Track product usage events, feature adoption, cohort retention, and user engagement
 */

// =====================================================
// Types & Interfaces
// =====================================================

export interface UsageEvent {
    id?: string;
    tenant_id?: string;
    customer_id?: string;
    user_id: string;
    feature_name: string;
    event_type: 'feature_used' | 'api_call' | 'page_view' | 'button_click' | 'form_submit' | 'export' | 'report_run' | 'integration_sync';
    session_id?: string;
    session_duration_seconds?: number;
    metadata?: Record<string, any>;
    device_type?: string;
    browser?: string;
    os?: string;
    location_country?: string;
    timestamp?: Date;
}

export interface FeatureAdoptionMetric {
    id: string;
    tenant_id: string;
    feature_name: string;
    period: Date;
    period_type: 'day' | 'week' | 'month';
    total_users: number;
    active_users: number;
    new_users: number;
    adoption_rate: number;
    total_events: number;
    avg_usage_per_user: number;
}

export interface UserCohort {
    id: string;
    tenant_id: string;
    cohort_name: string;
    cohort_type: 'signup_month' | 'first_purchase' | 'plan_tier' | 'industry' | 'custom';
    cohort_date?: Date;
    criteria?: Record<string, any>;
    user_count: number;
}

export interface RetentionMetric {
    period_offset: number;
    period_date: Date;
    active_users: number;
    retention_rate: number;
    avg_events_per_user: number;
}

export interface StickinessStat {
    date: Date;
    dau: number;
    wau: number;
    mau: number;
    dau_mau_ratio: number;
    dau_wau_ratio: number;
}

// =====================================================
// Event Tracking
// =====================================================

export class UsageAnalyticsService {

    /**
     * Track a usage event (high-volume ingestion)
     */
    static async trackEvent(event: UsageEvent): Promise<void> {
        try {
            await supabase
                .from('product_usage_events')
                .insert({
                    ...event,
                    timestamp: event.timestamp || new Date()
                });

            // Fire and forget - don't wait for response
        } catch (error) {
            console.error('Error tracking usage event:', error);
            // Don't throw - tracking should not break user experience
        }
    }

    /**
     * Batch insert events for bulk import
     */
    static async trackEventsBatch(events: UsageEvent[]): Promise<void> {
        const batchSize = 1000; // Supabase recommended batch size

        for (let i = 0; i < events.length; i += batchSize) {
            const batch = events.slice(i, i + batchSize);

            await supabase
                .from('product_usage_events')
                .insert(batch.map(e => ({
                    ...e,
                    timestamp: e.timestamp || new Date()
                })));
        }
    }

    /**
     * Get feature adoption over time
     */
    static async getFeatureAdoption(
        dateRange: { start: Date; end: Date },
        periodType: 'day' | 'week' | 'month' = 'day'
    ): Promise<FeatureAdoptionMetric[]> {
        const { data, error } = await supabase
            .from('feature_adoption_metrics')
            .select('*')
            .eq('period_type', periodType)
            .gte('period', dateRange.start.toISOString())
            .lte('period', dateRange.end.toISOString())
            .order('period', { ascending: true });

        if (error) throw error;
        return data;
    }

    /**
     * Get top features by usage
     */
    static async getTopFeatures(limit: number = 10): Promise<any[]> {
        const { data, error } = await supabase
            .from('mv_top_features') // Materialized view
            .select('*')
            .order('unique_users', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }

    /**
     * Calculate feature adoption in real-time (not pre-aggregated)
     */
    static async calculateFeatureAdoption(
        featureName: string,
        startDate: Date,
        endDate: Date
    ): Promise<any> {
        // Count total users in period
        const { data: usersData, error: usersError } = await supabase
            .rpc('get_active_users_count', {
                p_start_date: startDate.toISOString(),
                p_end_date: endDate.toISOString()
            });

        if (usersError) throw usersError;

        // Count users who used this feature
        const { data: featureUsersData, error: featureError } = await supabase
            .from('product_usage_events')
            .select('user_id', { count: 'exact', head: false })
            .eq('feature_name', featureName)
            .gte('timestamp', startDate.toISOString())
            .lte('timestamp', endDate.toISOString());

        if (featureError) throw featureError;

        const totalUsers = usersData || 0;
        const activeUsers = new Set(featureUsersData?.map(d => d.user_id)).size || 0;
        const adoptionRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

        return {
            feature_name: featureName,
            total_users: totalUsers,
            active_users: activeUsers,
            adoption_rate: Math.round(adoptionRate * 100) / 100
        };
    }

    // =====================================================
    // Cohort Analysis
    // =====================================================

    /**
     * Create a cohort based on criteria
     */
    static async createCohort(cohort: Partial<UserCohort>): Promise<UserCohort> {
        // Calculate user count based on criteria
        const userCount = await this.calculateCohortSize(cohort.criteria || {});

        const { data, error } = await supabase
            .from('user_cohorts')
            .insert({
                ...cohort,
                user_count: userCount
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Get cohort retention analysis
     */
    static async getCohortRetention(cohortId: string): Promise<RetentionMetric[]> {
        const { data, error } = await supabase
            .from('cohort_retention_metrics')
            .select('*')
            .eq('cohort_id', cohortId)
            .order('period_offset', { ascending: true });

        if (error) throw error;
        return data;
    }

    /**
     * Calculate retention matrix for all cohorts
     */
    static async getRetentionMatrix(): Promise<any> {
        const { data: cohorts } = await supabase
            .from('user_cohorts')
            .select('id, cohort_name, cohort_date, user_count')
            .order('cohort_date', { ascending: true });

        if (!cohorts) return [];

        const matrix = [];

        for (const cohort of cohorts) {
            const { data: retention } = await supabase
                .from('cohort_retention_metrics')
                .select('period_offset, retention_rate')
                .eq('cohort_id', cohort.id)
                .order('period_offset', { ascending: true });

            matrix.push({
                cohort_name: cohort.cohort_name,
                cohort_date: cohort.cohort_date,
                initial_size: cohort.user_count,
                retention_by_period: retention || []
            });
        }

        return matrix;
    }

    // =====================================================
    // Product Stickiness
    // =====================================================

    /**
     * Get product stickiness metrics (DAU/MAU ratios)
     */
    static async getProductStickiness(
        days: number = 30,
        featureName?: string
    ): Promise<StickinessStat[]> {
        const since = new Date();
        since.setDate(since.getDate() - days);

        let query = supabase
            .from('feature_stickiness_metrics')
            .select('*')
            .gte('metric_date', since.toISOString())
            .order('metric_date', { ascending: true });

        if (featureName) {
            query = query.eq('feature_name', featureName);
        } else {
            query = query.is('feature_name', null); // Overall product
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.map(d => ({
            date: new Date(d.metric_date),
            dau: d.daily_active_users,
            wau: d.weekly_active_users,
            mau: d.monthly_active_users,
            dau_mau_ratio: d.dau_mau_ratio,
            dau_wau_ratio: d.dau_wau_ratio
        }));
    }

    /**
     * Calculate current stickiness (real-time)
     */
    static async calculateCurrentStickiness(): Promise<StickinessStat> {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);

        // Get DAU (last 24 hours)
        const { data: dauData } = await supabase
            .from('product_usage_events')
            .select('user_id')
            .gte('timestamp', yesterday.toISOString());

        const dau = new Set(dauData?.map(d => d.user_id)).size || 0;

        // Get WAU (last 7 days)
        const { data: wauData } = await supabase
            .from('product_usage_events')
            .select('user_id')
            .gte('timestamp', weekAgo.toISOString());

        const wau = new Set(wauData?.map(d => d.user_id)).size || 0;

        // Get MAU (last 30 days)
        const { data: mauData } = await supabase
            .from('product_usage_events')
            .select('user_id')
            .gte('timestamp', monthAgo.toISOString());

        const mau = new Set(mauData?.map(d => d.user_id)).size || 0;

        return {
            date: today,
            dau,
            wau,
            mau,
            dau_mau_ratio: mau > 0 ? (dau / mau) * 100 : 0,
            dau_wau_ratio: wau > 0 ? (dau / wau) * 100 : 0
        };
    }

    // =====================================================
    // Session Analytics
    // =====================================================

    /**
     * Get user sesssions
     */
    static async getUserSessions(
        userId: string,
        limit: number = 50
    ): Promise<any[]> {
        const { data, error } = await supabase
            .from('user_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('start_time', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }

    /**
     * Get session metrics
     */
    static async getSessionMetrics(days: number = 30): Promise<any> {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const { data, error } = await supabase
            .from('user_sessions')
            .select('duration_seconds, unique_features_count, bounce, converted')
            .gte('start_time', since.toISOString());

        if (error) throw error;

        const totalSessions = data.length;
        const bounces = data.filter(s => s.bounce).length;
        const conversions = data.filter(s => s.converted).length;
        const avgDuration = data.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / totalSessions;
        const avgFeatures = data.reduce((sum, s) => sum + (s.unique_features_count || 0), 0) / totalSessions;

        return {
            total_sessions: totalSessions,
            bounce_rate: (bounces / totalSessions) * 100,
            conversion_rate: (conversions / totalSessions) * 100,
            avg_duration_seconds: Math.round(avgDuration),
            avg_features_per_session: Math.round(avgFeatures * 10) / 10
        };
    }

    // =====================================================
    // Funnel Analysis
    // =====================================================

    /**
     * Get funnel conversion metrics
     */
    static async getFunnelMetrics(
        funnelId: string,
        startDate: Date,
        endDate: Date
    ): Promise<any[]> {
        const { data, error } = await supabase
            .from('funnel_metrics')
            .select('*')
            .eq('funnel_id', funnelId)
            .gte('period_date', startDate.toISOString())
            .lte('period_date', endDate.toISOString())
            .order('step_number', { ascending: true });

        if (error) throw error;
        return data;
    }

    /**
     * Calculate funnel conversion in real-time
     */
    static async calculateFunnelConversion(
        funnelId: string,
        startDate: Date,
        endDate: Date
    ): Promise<any> {
        // Get funnel definition
        const { data: funnel, error: funnelError } = await supabase
            .from('funnel_definitions')
            .select('*')
            .eq('id', funnelId)
            .single();

        if (funnelError || !funnel) throw new Error('Funnel not found');

        const steps = funnel.steps;
        const results = [];

        let previousStepUsers: Set<string> | null = null;

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];

            // Query users who completed this step
            const { data: stepData } = await supabase
                .from('product_usage_events')
                .select('user_id')
                .eq('feature_name', step.feature)
                .eq('event_type', step.event)
                .gte('timestamp', startDate.toISOString())
                .lte('timestamp', endDate.toISOString());

            const stepUsers = new Set<string>(stepData?.map(d => d.user_id));
            const stepCount = stepUsers.size;

            // Calculate conversion from previous step
            const usersEntered = previousStepUsers ? previousStepUsers.size : stepCount;
            const conversionRate = usersEntered > 0 ? (stepCount / usersEntered) * 100 : 100;
            const dropOffRate = 100 - conversionRate;

            results.push({
                step_number: step.step,
                step_name: step.name || step.feature,
                users_entered: usersEntered,
                users_completed: stepCount,
                conversion_rate: Math.round(conversionRate * 100) / 100,
                drop_off_rate: Math.round(dropOffRate * 100) / 100
            });

            previousStepUsers = stepUsers;
        }

        return results;
    }

    // =====================================================
    // Helper Methods
    // =====================================================

    private static async calculateCohortSize(criteria: Record<string, any>): Promise<number> {
        // This would query users table based on criteria
        // For now, return mock value
        return 100;
    }

    /**
     * Refresh materialized views (should be called via cron job)
     */
    static async refreshMaterializedViews(): Promise<void> {
        await supabase.rpc('refresh_materialized_view', { view_name: 'mv_top_features' });
        await supabase.rpc('refresh_materialized_view', { view_name: 'mv_engagement_summary' });
    }
}

export default UsageAnalyticsService;
