import { supabase } from '@/lib/db';

// Property Management Service
export class PropertyManagementService {
    static async getProperties(): Promise<any[]> {
        const { data, error } = await supabase
            .from('properties')
            .select('*, property_units(count)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }

    static async getPropertyUnits(propertyId: string): Promise<any[]> {
        const { data } = await supabase
            .from('property_units')
            .select('*')
            .eq('property_id', propertyId);
        return data || [];
    }

    static async getMaintenanceRequests(filters: any = {}): Promise<any[]> {
        let query = supabase
            .from('property_maintenance')
            .select('*, properties(property_name), property_units(unit_number)')
            .order('requested_at', { ascending: false });

        if (filters.status) query = query.eq('status', filters.status);
        if (filters.property_id) query = query.eq('property_id', filters.property_id);

        const { data } = await query;
        return data || [];
    }
}

// Lease Management Service
export class LeaseManagementService {
    static async getLeases(filters: any = {}): Promise<any[]> {
        let query = supabase
            .from('leases')
            .select(`
        *,
        properties(property_name),
        property_units(unit_number)
      `)
            .order('start_date', { ascending: false });

        if (filters.status) query = query.eq('status', filters.status);

        const { data } = await query;
        return data || [];
    }

    static async createLease(leaseData: any): Promise<any> {
        const leaseNumber = `LSE-${Date.now()}`;

        const { data, error } = await supabase
            .from('leases')
            .insert({
                ...leaseData,
                lease_number: leaseNumber,
                status: 'draft'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async getExpiringLeases(days: number = 60): Promise<any[]> {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        const { data } = await supabase
            .from('leases')
            .select('*, properties(property_name), property_units(unit_number)')
            .eq('status', 'active')
            .lte('end_date', futureDate.toISOString())
            .order('end_date', { ascending: true });

        return data || [];
    }

    static async processRenewal(leaseId: string, renewalData: any): Promise<void> {
        await supabase
            .from('lease_renewals')
            .insert({
                original_lease_id: leaseId,
                ...renewalData,
                renewal_status: 'offered'
            });
    }
}

// Listing Portal Service
export class ListingPortalService {
    static async getListings(filters: any = {}): Promise<any[]> {
        let query = supabase
            .from('property_listings')
            .select(`
        *,
        properties(property_name, city, state),
        property_units(unit_number, bedrooms, bathrooms, sqft)
      `)
            .order('created_at', { ascending: false });

        if (filters.status) query = query.eq('status', filters.status);

        const { data } = await query;
        return data || [];
    }

    static async publishListing(listingId: string): Promise<void> {
        await supabase
            .from('property_listings')
            .update({
                status: 'published',
                published_at: new Date()
            })
            .eq('id', listingId);
    }

    static async getInquiries(listingId?: string): Promise<any[]> {
        let query = supabase
            .from('listing_inquiries')
            .select('*, property_listings(listing_title)')
            .order('created_at', { ascending: false });

        if (listingId) query = query.eq('listing_id', listingId);

        const { data } = await query;
        return data || [];
    }

    static async scheduleShowing(showingData: any): Promise<any> {
        const { data, error } = await supabase
            .from('property_showings')
            .insert({
                ...showingData,
                status: 'scheduled'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

export default { PropertyManagementService, LeaseManagementService, ListingPortalService };
