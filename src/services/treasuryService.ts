/**
 * Treasury Service
 * API integration for treasury management operations
 */

import { apiRequest } from "@/lib/queryClient";
import type {
    TreasuryDeal,
    TreasuryFxDeal,
    TreasuryCounterparty,
    TreasuryHedgeRelationship,
    TreasuryRiskLimit,
} from "@/types/erp-types";

export const treasuryService = {
    // ========== Counterparties ==========
    async listCounterparties(): Promise<TreasuryCounterparty[]> {
        const res = await apiRequest("GET", "/api/treasury/counterparties");
        return await res.json();
    },

    async createCounterparty(data: Partial<TreasuryCounterparty>): Promise<TreasuryCounterparty> {
        const res = await apiRequest("POST", "/api/treasury/counterparties", data);
        return await res.json();
    },

    // ========== Money Market Deals ==========
    async listDeals(filters?: {
        type?: string;
        status?: string;
    }): Promise<TreasuryDeal[]> {
        const params = new URLSearchParams();
        if (filters?.type) params.append("type", filters.type);
        if (filters?.status) params.append("status", filters.status);

        const res = await apiRequest(
            "GET",
            `/api/treasury/deals${params.toString() ? `?${params.toString()}` : ""}`
        );
        return await res.json();
    },

    async getDeal(id: string): Promise<TreasuryDeal> {
        const res = await apiRequest("GET", `/api/treasury/deals/${id}`);
        return await res.json();
    },

    async createDeal(data: Partial<TreasuryDeal>): Promise<TreasuryDeal> {
        const res = await apiRequest("POST", "/api/treasury/deals", data);
        return await res.json();
    },

    async updateDealStatus(id: string, status: string): Promise<TreasuryDeal> {
        const res = await apiRequest("PATCH", `/api/treasury/deals/${id}/status`, { status });
        return await res.json();
    },

    async confirmDeal(id: string): Promise<TreasuryDeal> {
        const res = await apiRequest("POST", `/api/treasury/deals/${id}/confirm`, {});
        return await res.json();
    },

    async settleDeal(id: string): Promise<TreasuryDeal> {
        const res = await apiRequest("POST", `/api/treasury/deals/${id}/settle`, {});
        return await res.json();
    },

    // ========== FX Deals ==========
    async listFxDeals(): Promise<TreasuryFxDeal[]> {
        const res = await apiRequest("GET", "/api/treasury/fx-deals");
        return await res.json();
    },

    async createFxDeal(data: Partial<TreasuryFxDeal>): Promise<TreasuryFxDeal> {
        const res = await apiRequest("POST", "/api/treasury/fx-deals", data);
        return await res.json();
    },

    async revalueFxDeal(id: string): Promise<{ markToMarket: number }> {
        const res = await apiRequest("POST", `/api/treasury/fx-deals/${id}/revalue`, {});
        return await res.json();
    },

    async confirmFxDeal(id: string): Promise<TreasuryFxDeal> {
        const res = await apiRequest("POST", `/api/treasury/fx-deals/${id}/confirm`, {});
        return await res.json();
    },

    async settleFxDeal(id: string): Promise<TreasuryFxDeal> {
        const res = await apiRequest("POST", `/api/treasury/fx-deals/${id}/settle`, {});
        return await res.json();
    },

    // ========== Market Rates ==========
    async updateMarketRates(rates: Array<{
        currencyPair: string;
        rate: number;
        rateDate: string;
    }>): Promise<void> {
        for (const rate of rates) {
            await apiRequest("POST", "/api/treasury/market-rates", rate);
        }
    },

    // ========== Risk Limits ==========
    async listRiskLimits(): Promise<TreasuryRiskLimit[]> {
        const res = await apiRequest("GET", "/api/treasury/risk-limits");
        return await res.json();
    },

    async createRiskLimit(data: Partial<TreasuryRiskLimit>): Promise<TreasuryRiskLimit> {
        const res = await apiRequest("POST", "/api/treasury/risk-limits", data);
        return await res.json();
    },

    async deleteRiskLimit(id: string): Promise<void> {
        await apiRequest("DELETE", `/api/treasury/risk-limits/${id}`);
    },

    async getRiskMetrics(): Promise<{
        portfolioDuration?: number;
        valueAtRisk95?: number;
        activeHedges?: number;
    }> {
        const res = await apiRequest("GET", "/api/treasury/risk-metrics");
        return await res.json();
    },

    // ========== Hedge Relationships ==========
    async listHedgeRelationships(dealId?: string): Promise<TreasuryHedgeRelationship[]> {
        const params = dealId ? `?dealId=${dealId}` : "";
        const res = await apiRequest("GET", `/api/treasury/hedges${params}`);
        return await res.json();
    },

    async createHedgeRelationship(data: {
        dealId: string;
        sourceType: string;
        sourceId: string;
        amount: number;
    }): Promise<TreasuryHedgeRelationship> {
        const res = await apiRequest("POST", "/api/treasury/hedges", data);
        return await res.json();
    },

    // ========== Cash Forecasting ==========
    async generateForecast(days: number = 90): Promise<void> {
        await apiRequest("POST", "/api/treasury/forecast/generate", { days });
    },

    async getForecastData(): Promise<Array<{
        id: string;
        forecastDate: string;
        amount: string;
        source: string;
    }>> {
        const res = await apiRequest("GET", "/api/treasury/forecast");
        return await res.json();
    },

    async detectAnomalies(): Promise<Array<{
        id: string;
        amount: string;
        reason: string;
    }>> {
        const res = await apiRequest("GET", "/api/treasury/anomalies");
        return await res.json();
    },

    // ========== Netting ==========
    async createNettingBatch(asOfDate: Date): Promise<{ id: string }> {
        const res = await apiRequest("POST", "/api/treasury/netting/batches", {
            asOfDate: asOfDate.toISOString(),
        });
        return await res.json();
    },

    async getNetPositions(batchId: string): Promise<Array<{
        fromEntity: string;
        toEntity: string;
        currency: string;
        netAmount: string;
    }>> {
        const res = await apiRequest("GET", `/api/treasury/netting/batches/${batchId}/positions`);
        return await res.json();
    },

    async settleBatch(batchId: string): Promise<{ success: boolean }> {
        const res = await apiRequest("POST", `/api/treasury/netting/batches/${batchId}/settle`, {});
        return await res.json();
    },
};

export default treasuryService;
