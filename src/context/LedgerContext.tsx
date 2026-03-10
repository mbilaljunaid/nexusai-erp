
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface GlLedger { id: string; name?: string; currencyCode?: string;[key: string]: any; }

interface LedgerContextType {
    currentLedgerId: string;
    setCurrentLedgerId: (id: string) => void;
    ledgers: GlLedger[];
    isLoading: boolean;
    activeLedger: GlLedger | undefined;
}

const STORAGE_KEY = "nexusai_selected_ledger_id";

const GL_QUERY_KEYS = [
    "/api/gl/journals",
    "/api/gl/reporting/trial-balance",
    "/api/gl/reporting/drill-down",
    "/api/gl/reporting/explain-variance",
    "/api/gl/periods",
    "/api/gl/revaluations",
    "/api/gl/allocations",
    "/api/gl/budget-balances",
    "/api/gl/stats",
    "/api/gl/consolidation/variance",
    "/api/gl/consolidation/history",
];

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

export function LedgerProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();

    // Restore from localStorage, fallback to PRIMARY
    const [currentLedgerId, _setCurrentLedgerId] = useState<string>(() => {
        try { return localStorage.getItem(STORAGE_KEY) || "PRIMARY"; } catch { return "PRIMARY"; }
    });

    // Fetch available ledgers from backend
    const { data: ledgers, isLoading } = useQuery<GlLedger[]>({
        queryKey: ["/api/finance/gl/ledgers"],
        staleTime: 5 * 60 * 1000, // ledgers rarely change
    });

    const activeLedger = (ledgers || []).find(l => l.id === currentLedgerId);

    const setCurrentLedgerId = useCallback((id: string) => {
        _setCurrentLedgerId(id);
        try { localStorage.setItem(STORAGE_KEY, id); } catch { /* ignore */ }
        // Invalidate all GL queries so they re-fetch with the new ledger
        GL_QUERY_KEYS.forEach(key => {
            queryClient.invalidateQueries({ queryKey: [key] });
        });
    }, [queryClient]);

    const value: LedgerContextType = {
        currentLedgerId,
        setCurrentLedgerId,
        ledgers: ledgers || [],
        isLoading,
        activeLedger,
    };

    return (
        <LedgerContext.Provider value={value}>
            {children}
        </LedgerContext.Provider>
    );
}

export function useLedger() {
    const context = useContext(LedgerContext);
    if (!context) throw new Error("useLedger must be used within a LedgerProvider");
    return context;
}
