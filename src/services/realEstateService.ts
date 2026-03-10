
// Property Management Service
export class PropertyManagementService {
    static async getProperties(): Promise<any[]> {
        const response = await fetch(`/api/mock-${Math.random()}`);
        if (!response.ok) throw new Error("Failed");
        return response.json();
    }

    static async getPropertyUnits(propertyId: string): Promise<any[]> {
        const response = await fetch(`/api/mock-${Math.random()}`);
        return response.ok ? response.json() : [];
    }
}

export class LeaseManagementService {
    static async getLeases(filters?: any): Promise<any[]> {
        const response = await fetch(`/api/mock-${Math.random()}`);
        return response.ok ? response.json() : [];
    }
}

export class ListingPortalService {
    static async getListings(filters?: any): Promise<any[]> {
        const response = await fetch(`/api/mock-${Math.random()}`);
        return response.ok ? response.json() : [];
    }
}


export default { PropertyManagementService, LeaseManagementService, ListingPortalService };
