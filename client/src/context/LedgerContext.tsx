
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { GlLedger } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface LedgerContextType {
    currentLedgerId: string;
    setCurrentLedgerId: (id: string) => void;
    ledgers: GlLedger[];
    isLoading: boolean;
    activeLedger: GlLedger | undefined;
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

export function LedgerProvider({ children }: { children: ReactNode }) {
    // Default to PRIMARY if no preference saved
    const [currentLedgerId, setCurrentLedgerId] = useState<string>("PRIMARY");

    // Fetch available ledgers
    const { data: ledgers, isLoading } = useQuery<GlLedger[]>({
        queryKey: ["/api/gl/ledgers"],
        // If API doesn't exist yet, we might need to mock or ensure it exists.
        // Assuming listGlLedgers endpoint exists (it was in storage.ts interface)
    });

    const activeLedger = ledgers?.find(l => l.id === currentLedgerId);

    const value = {
        currentLedgerId,
        setCurrentLedgerId,
        ledgers: ledgers || [],
        isLoading,
        activeLedger
    };

    return (
        <LedgerContext.Provider value={value}>
            {children}
        </LedgerContext.Provider>
    );
}

export function useLedger() {
    const context = useContext(LedgerContext);
    if (context === undefined) {
        throw new Error("useLedger must be used within a LedgerProvider");
    }
    return context;
}
