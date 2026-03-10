
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
        const response = await fetch(`/api/mock-${Math.random()}`);
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();

        // Transform into waterfall format
        const waterfall = this.transformToWaterfall(data);
        return waterfall;
    }

    /**
     * Get current SaaS metrics
     */
    static async getCurrentMetrics(): Promise<SaaSMetrics> {
        const response = await fetch(`/api/mock-${Math.random()}`);
        if (!response.ok) throw new Error("Failed");
        return response.json();
    }

    /**
     * Calculate Net Revenue Retention (NRR)
     */
    static async calculateNRR(startDate: Date, endDate: Date): Promise<number> {
        const response = await fetch(`/api/mock-${Math.random()}`);
        if (!response.ok) throw new Error("Failed");
        return response.json();
    }

    /**
     * Get plan performance metrics
     */
    static async getPlanPerformance(months: number = 6): Promise<any[]> {
        const since = new Date();
        since.setMonth(since.getMonth() - months);

        const response = await fetch(`/api/mock-${Math.random()}`);
        if (!response.ok) throw new Error("Failed");
        return response.json();
    }

    /**
     * Calculate current Quick Ratio
     */
    static async getQuickRatio(period: Date): Promise<number> {
        const response = await fetch(`/api/mock-${Math.random()}`);
        if (!response.ok) return 0;
        return response.json();
    }

    /**
     * Get revenue by customer segment
     */
    static async getRevenueBySegment(): Promise<any> {
        const response = await fetch(`/api/mock-${Math.random()}`);
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();

        // Group by segment
        const segments = (data || []).reduce((acc: any, row: any) => {
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
