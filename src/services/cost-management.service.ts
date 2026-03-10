

export interface ValuationMetrics {
    totalValuation: number;
    lowStockItems: number;
    stockOuts: number;
    pendingReceipts: number;
    inventoryTurns: number;
}

export const CostManagementService = {
    /**
     * Fetches the real-time inventory valuation for a given organization.
     * Uses the hybrid NestJS/Express backend.
     */
    async getWorkspaceValuation(orgId: string): Promise<number> {
        try {
            const response = await fetch(`/api/cost-management/valuation/${orgId}`);
            if (!response.ok) {
                console.error('Failed to fetch valuation:', response.statusText);
                return 0;
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching valuation:', error);
            return 0;
        }
    },

    /**
     * Helper to find the default inventory organization
     */
    async getDefaultOrganization(): Promise<string | null> {
        try {
            const response = await fetch('/inventory/warehouses');
            if (!response.ok) return null;
            const warehouses = await response.json();
            return warehouses.length > 0 ? warehouses[0].id : null;
        } catch (error) {
            console.error('Error fetching organizations:', error);
            return null;
        }
    }
};
