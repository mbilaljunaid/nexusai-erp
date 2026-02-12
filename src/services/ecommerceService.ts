import { supabase } from '@/lib/supabase';

// Marketplace Service
export class MarketplaceService {
    static async getVendors(status?: string): Promise<any[]> {
        let query = supabase.from('marketplace_vendors').select('*').order('created_at', { ascending: false });
        if (status) query = query.eq('status', status);
        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    static async approveVendor(vendorId: string): Promise<void> {
        await supabase.from('marketplace_vendors').update({ status: 'approved' }).eq('id', vendorId);
    }

    static async getCommissions(vendorId?: string): Promise<any[]> {
        let query = supabase.from('marketplace_commissions').select('*, marketplace_vendors(vendor_name)');
        if (vendorId) query = query.eq('vendor_id', vendorId);
        const { data } = await query;
        return data || [];
    }
}

// Returns Management Service
export class ReturnsService {
    static async createRMA(rmaData: any): Promise<any> {
        const rmaNumber = `RMA-${Date.now()}`;
        const { data, error } = await supabase
            .from('rma_requests')
            .insert({ ...rmaData, rma_number: rmaNumber, status: 'pending' })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async getRMAs(filters: any = {}): Promise<any[]> {
        let query = supabase.from('rma_requests').select('*').order('created_at', { ascending: false });
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.customer_id) query = query.eq('customer_id', filters.customer_id);
        const { data } = await query;
        return data || [];
    }

    static async approveRMA(rmaId: string, refundAmount: number): Promise<void> {
        await supabase
            .from('rma_requests')
            .update({ status: 'approved', refund_amount: refundAmount, approved_at: new Date() })
            .eq('id', rmaId);
    }

    static async processRefund(rmaId: string): Promise<void> {
        await supabase
            .from('rma_requests')
            .update({ status: 'refunded', refunded_at: new Date() })
            .eq('id', rmaId);
    }
}

// Digital Asset Management Service
export class DAMService {
    static async uploadAsset(file: File, metadata: any): Promise<any> {
        // In production, upload to storage (S3/Supabase Storage)
        const { data, error } = await supabase
            .from('dam_assets')
            .insert({
                filename: file.name,
                file_type: file.type.startsWith('image/') ? 'image' : 'document',
                mime_type: file.type,
                file_size_bytes: file.size,
                storage_url: `/uploads/${file.name}`, // Mock URL
                ...metadata
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async getAssets(filters: any = {}): Promise<any[]> {
        let query = supabase.from('dam_assets').select('*').order('created_at', { ascending: false });
        if (filters.file_type) query = query.eq('file_type', filters.file_type);
        if (filters.folder_id) query = query.eq('folder_id', filters.folder_id);
        const { data } = await query;
        return data || [];
    }

    static async getFolders(): Promise<any[]> {
        const { data } = await supabase.from('dam_folders').select('*').order('path');
        return data || [];
    }

    static async deleteAsset(assetId: string): Promise<void> {
        await supabase.from('dam_assets').delete().eq('id', assetId);
    }
}

export default { MarketplaceService, ReturnsService, DAMService };
