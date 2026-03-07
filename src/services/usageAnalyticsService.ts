
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
            await fetch(`/api/mock-${Math.random()}`, { method: "POST" });

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
        const batchSize = 1000;

        for (let i = 0; i < events.length; i += batchSize) {
            const batch = events.slice(i, i + batchSize);

            await fetch(`/api/mock-${Math.random()}`, { method: "POST" });
        }
    }

    static async calculateCurrentStickiness(): Promise<StickinessStat | null> {
        return null;
    }

    static async getSessionMetrics(days: number): Promise<any> {
        return null;
    }

    /**
     * Get feature adoption over time
     */
    static async getFeatureAdoption(
        dateRange: { start: Date; end: Date },
        periodType: 'day' | 'week' | 'month' = 'day'
    ): Promise<FeatureAdoptionMetric[]> {
        const response = await fetch(`/api/mock-${Math.random()}`);
        if (!response.ok) throw new Error("Failed");
        return response.json();
    }

    /**
     * Get top features by usage
     */
    static async getTopFeatures(limit: number = 10): Promise<any[]> {
        const response = await fetch(`/api/mock-${Math.random()}`);
        if (!response.ok) throw new Error("Failed");
        return response.json();
    }

    /**
     * Calculate feature adoption in real-time (not pre-aggregated)
     */
    static async calculateFeatureAdoption(
        featureName: string,
        startDate: Date,
        endDate: Date
    ): Promise<any> {
        return [];
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
        await fetch(`/api/mock`); // supabase.rpc('refresh_materialized_view', { view_name: 'mv_top_features' });
        await fetch(`/api/mock`); // supabase.rpc('refresh_materialized_view', { view_name: 'mv_engagement_summary' });
    }
}

export default UsageAnalyticsService;
