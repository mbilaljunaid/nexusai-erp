import { supabase } from '@/lib/supabase';

// Grid Management Service
export class GridManagementService {
    static async getGridAssets(filters: any = {}): Promise<any[]> {
        let query = supabase.from('grid_assets').select('*').order('asset_id');
        if (filters.asset_type) query = query.eq('asset_type', filters.asset_type);
        if (filters.status) query = query.eq('status', filters.status);
        const { data } = await query;
        return data || [];
    }

    static async getAssetHealth(): Promise<any> {
        const { data } = await supabase.from('grid_assets').select('status, health_score');
        const avgHealth = data?.reduce((sum, a) => sum + (a.health_score || 0), 0) / (data?.length || 1);
        return {
            total_assets: data?.length || 0,
            avg_health_score: Math.round(avgHealth),
            critical_count: data?.filter(a => a.health_score < 50).length || 0
        };
    }
}

// Meter Data Management Service
export class MeterDataService {
    static async getMeters(customerId?: string): Promise<any[]> {
        let query = supabase.from('smart_meters').select('*');
        if (customerId) query = query.eq('customer_id', customerId);
        const { data } = await query;
        return data || [];
    }

    static async getMeterReadings(meterId: string, days: number = 30): Promise<any[]> {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const { data } = await supabase
            .from('meter_readings')
            .select('*')
            .eq('meter_id', meterId)
            .gte('read_timestamp', since.toISOString())
            .order('read_timestamp', { ascending: false });
        return data || [];
    }
}

// Outage Management Service
export class OutageManagementService {
    static async getActiveOutages(): Promise<any[]> {
        const { data } = await supabase
            .from('outages')
            .select('*')
            .in('status', ['reported', 'dispatched', 'crew_assigned', 'in_progress'])
            .order('priority', { ascending: false });
        return data || [];
    }

    static async createOutage(outageData: any): Promise<any> {
        const outageNumber = `OUT-${Date.now()}`;
        const { data, error } = await supabase
            .from('outages')
            .insert({ ...outageData, outage_number: outageNumber })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async getOutageStats(): Promise<any> {
        const { data } = await supabase.from('outages').select('status, affected_customers');
        return {
            active_count: data?.filter(o => o.status !== 'closed').length || 0,
            total_affected: data?.reduce((sum, o) => sum + (o.affected_customers || 0), 0) || 0
        };
    }
}

// Demand Response Service
export class DemandResponseService {
    static async getPrograms(): Promise<any[]> {
        const { data } = await supabase
            .from('dr_programs')
            .select('*')
            .eq('is_active', true);
        return data || [];
    }

    static async getDREvents(programId?: string): Promise<any[]> {
        let query = supabase.from('dr_events').select('*, dr_programs(program_name)');
        if (programId) query = query.eq('program_id', programId);
        const { data } = await query.order('event_start', { ascending: false });
        return data || [];
    }

    static async enrollCustomer(programId: string, customerId: string, committedReduction: number): Promise<void> {
        await supabase.from('dr_enrollments').insert({
            program_id: programId,
            customer_id: customerId,
            committed_reduction_kw: committedReduction
        });
    }
}

// Energy Trading Service
export class EnergyTradingService {
    static async getContracts(status?: string): Promise<any[]> {
        let query = supabase.from('energy_contracts').select('*');
        if (status) query = query.eq('status', status);
        const { data } = await query.order('delivery_start', { ascending: false });
        return data || [];
    }

    static async getTradingPosition(date?: string): Promise<any> {
        const positionDate = date || new Date().toISOString().split('T')[0];
        const { data } = await supabase
            .from('trading_positions')
            .select('*')
            .eq('position_date', positionDate)
            .single();
        return data;
    }
}

// Regulatory Compliance Service
export class ComplianceService {
    static async getFilings(status?: string): Promise<any[]> {
        let query = supabase
            .from('compliance_filings')
            .select('*, compliance_regulations(regulation_name, regulatory_body)');
        if (status) query = query.eq('status', status);
        const { data } = await query.order('due_date', { ascending: true });
        return data || [];
    }

    static async getUpcomingFilings(days: number = 30): Promise<any[]> {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        const { data } = await supabase
            .from('compliance_filings')
            .select('*, compliance_regulations(regulation_name)')
            .lte('due_date', futureDate.toISOString())
            .eq('status', 'pending');
        return data || [];
    }

    static async getViolations(): Promise<any[]> {
        const { data } = await supabase
            .from('compliance_violations')
            .select('*, compliance_regulations(regulation_name)')
            .order('violation_date', { ascending: false });
        return data || [];
    }
}

export default {
    GridManagementService,
    MeterDataService,
    OutageManagementService,
    DemandResponseService,
    EnergyTradingService,
    ComplianceService
};
