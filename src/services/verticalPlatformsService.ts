import { supabase } from '@/lib/db';

// Government Services
export class GovernmentService {
    static async getTaxFilings(taxpayerId?: string): Promise<any[]> {
        let query = supabase.from('tax_filings').select('*');
        if (taxpayerId) query = query.eq('taxpayer_id', taxpayerId);
        const { data } = await query.order('tax_year', { ascending: false });
        return data || [];
    }

    static async getPublicAssets(assetType?: string): Promise<any[]> {
        let query = supabase.from('public_assets').select('*');
        if (assetType) query = query.eq('asset_type', assetType);
        const { data } = await query;
        return data || [];
    }

    static async getEmergencyIncidents(status?: string): Promise<any[]> {
        let query = supabase.from('emergency_incidents').select('*');
        if (status) query = query.eq('status', status);
        const { data } = await query.order('declared_at', { ascending: false });
        return data || [];
    }
}

// Insurance Services
export class InsuranceService {
    static async getClaims(status?: string): Promise<any[]> {
        let query = supabase.from('insurance_claims').select('*');
        if (status) query = query.eq('status', status);
        const { data } = await query.order('reported_date', { ascending: false });
        return data || [];
    }

    static async getReinsuranceTreaties(): Promise<any[]> {
        const { data } = await supabase.from('reinsurance_treaties').select('*').eq('status', 'active');
        return data || [];
    }

    static async getUnderwritingSubmissions(status?: string): Promise<any[]> {
        let query = supabase.from('underwriting_submissions').select('*');
        if (status) query = query.eq('status', status);
        const { data } = await query.order('created_at', { ascending: false });
        return data || [];
    }
}

// Education Services
export class EducationService {
    static async getFinancialAidApplications(studentId?: string): Promise<any[]> {
        let query = supabase.from('financial_aid_applications').select('*');
        if (studentId) query = query.eq('student_id', studentId);
        const { data } = await query;
        return data || [];
    }

    static async getAdmissionApplications(status?: string): Promise<any[]> {
        let query = supabase.from('admission_applications').select('*');
        if (status) query = query.eq('status', status);
        const { data } = await query.order('created_at', { ascending: false });
        return data || [];
    }

    static async getStudents(): Promise<any[]> {
        const { data } = await supabase.from('students').select('*').eq('enrollment_status', 'enrolled');
        return data || [];
    }
}

// Automotive Services
export class AutomotiveService {
    static async getVehicleInventory(status?: string): Promise<any[]> {
        let query = supabase.from('vehicle_inventory').select('*');
        if (status) query = query.eq('status', status);
        const { data } = await query.order('created_at', { ascending: false });
        return data || [];
    }

    static async getServiceAppointments(date?: string): Promise<any[]> {
        let query = supabase.from('service_appointments').select('*');
        if (date) query = query.gte('scheduled_date', date);
        const { data } = await query.order('scheduled_date');
        return data || [];
    }

    static async getAutoParts(category?: string): Promise<any[]> {
        let query = supabase.from('auto_parts').select('*');
        if (category) query = query.eq('category', category);
        const { data } = await query;
        return data || [];
    }
}

export default { GovernmentService, InsuranceService, EducationService, AutomotiveService };
