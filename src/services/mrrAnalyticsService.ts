import { supabase } from '@/lib/db';

export interface MRRMovement {
    id: string;
    period: Date;
    movement_type: 'new' | 'expansion' | 'contraction' | 'churn' | 'reactivation';
    customer_id: string;
    amount: number;
    arr_impact: number;
}

export interface SaaSMetrics {
    snapshot_date: Date;
    mrr: number;
    arr: number;
    total_customers: number;
    arpu: number;
    ltv: number;
    cac: number;
    ltv_cac_ratio: number;
    customer_churn_rate: number;
    net_revenue_retention: number;
    mrr_growth_rate: number;
}

export class MRRAnalyticsService {

    /**
     * Calculate MRR movements for a period
     */
    static async calculateMRRMovements(period: Date): Promise<void> {
        // This would typically be called by a scheduled job
        // Logic: Compare subscription changes month-over-month

        const startOfMonth = new Date(period.getFullYear(), period.getMonth(), 1);
        const endOfMonth = new Date(period.getFullYear(), period.getMonth() + 1, 0);

        // Query subscription changes from billing module
        // For each change, create an MRR movement record

        // This is a simplified version - actual implementation would:
        // 1. Query all subscription changes in the period
        // 2. Classify each as new/expansion/contraction/churn/reactivation
        // 3. Insert into mrr_movements table
    }

    /**
     * Get MRR waterfall for date range
     */
    static async getMRRWaterfall(startDate: Date, endDate: Date): Promise<any> {
        const { data, error } = await supabase
            .from('mv_mrr_waterfall')
            .select('*')
            .gte('period', startDate.toISOString())
            .lte('period', endDate.toISOString())
            .order('period', { ascending: true });

        if (error) throw error;

        // Transform into waterfall format
        const waterfall = this.transformToWaterfall(data);
        return waterfall;
    }

    /**
     * Get current SaaS metrics
     */
    static async getCurrentMetrics(): Promise<SaaSMetrics> {
        const { data, error } = await supabase
            .from('mv_current_saas_metrics')
            .select('*')
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Get SaaS metrics over time
     */
    static async getMetricsTimeseries(months: number = 12): Promise<SaaSMetrics[]> {
        const since = new Date();
        since.setMonth(since.getMonth() - months);

        const { data, error } = await supabase
            .from('saas_metrics_snapshot')
            .select('*')
            .gte('snapshot_date', since.toISOString())
            .order('snapshot_date', { ascending: true });

        if (error) throw error;
        return data;
    }

    /**
     * Calculate Net Revenue Retention (NRR)
     */
    static async calculateNRR(startDate: Date, endDate: Date): Promise<number> {
        const { data, error } = await supabase
            .rpc('calculate_nrr', {
                p_start_date: startDate.toISOString(),
                p_end_date: endDate.toISOString()
            });

        if (error) throw error;
        return data || 0;
    }

    /**
     * Get cohort LTV analysis
     */
    static async getCohortLTV(cohortMonth?: Date): Promise<any[]> {
        let query = supabase
            .from('cohort_ltv_analysis')
            .select('*')
            .order('cohort_month', { ascending: false });

        if (cohortMonth) {
            query = query.eq('cohort_month', cohortMonth.toISOString());
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    /**
     * Get plan performance metrics
     */
    static async getPlanPerformance(months: number = 6): Promise<any[]> {
        const since = new Date();
        since.setMonth(since.getMonth() - months);

        const { data, error } = await supabase
            .from('plan_performance_metrics')
            .select(`
        *,
        subscription_plans!plan_id (
          name,
          price
        )
      `)
            .gte('period', since.toISOString())
            .order('period', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Calculate current Quick Ratio
     */
    static async getQuickRatio(period: Date): Promise<number> {
        const { data, error } = await supabase
            .rpc('calculate_quick_ratio', {
                p_period: period.toISOString()
            });

        if (error) throw error;
        return data || 0;
    }

    /**
     * Get revenue by customer segment
     */
    static async getRevenueBySegment(): Promise<any> {
        const { data, error } = await supabase
            .from('customer_revenue_timeline')
            .select(`
        customer_id,
        mrr,
        customers (
          industry,
          company_size
        )
      `)
            .eq('period_date', new Date().toISOString().split('T')[0]);

        if (error) throw error;

        // Group by segment
        const segments = data.reduce((acc: any, row: any) => {
            const industry = row.customers?.industry || 'Unknown';
            if (!acc[industry]) acc[industry] = 0;
            acc[industry] += row.mrr;
            return acc;
        }, {});

        return segments;
    }

    private static transformToWaterfall(data: any[]): any {
        // Group by period and calculate cumulative
        const periods = [...new Set(data.map(d => d.period))].sort();

        return periods.map(period => {
            const periodData = data.filter(d => d.period === period);

            return {
                period,
                new: periodData.find(d => d.movement_type === 'new')?.total_amount || 0,
                expansion: periodData.find(d => d.movement_type === 'expansion')?.total_amount || 0,
                contraction: periodData.find(d => d.movement_type === 'contraction')?.total_amount || 0,
                churn: periodData.find(d => d.movement_type === 'churn')?.total_amount || 0,
                reactivation: periodData.find(d => d.movement_type === 'reactivation')?.total_amount || 0
            };
        });
    }
}

export default MRRAnalyticsService;
