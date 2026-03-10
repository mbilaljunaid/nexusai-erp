import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEnterpriseStore } from "@/lib/enterpriseStore";

export type ContextType = 'BU' | 'LE' | 'INV_ORG' | 'LEDGER' | 'SET_ID' | 'GLOBAL';

export interface UserDataAccess {
    id: string;
    tenantId: string;
    userId: string;
    roleId: string;
    contextType: ContextType;
    contextValue: string;
    isDefault: boolean;
}

interface EnterpriseContextState {
    activeBuId: string | null;
    activeLeId: string | null;
    activeInvOrgId: string | null;
    activeLedgerId: string | null;
    availableAccess: UserDataAccess[];
    isLoading: boolean;
    setActiveContext: (type: ContextType, id: string | null) => void;
}

const EnterpriseContext = createContext<EnterpriseContextState | undefined>(undefined);

export function EnterpriseProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [activeBuId, setActiveBuId] = useState<string | null>(null);
    const [activeLeId, setActiveLeId] = useState<string | null>(null);
    const [activeInvOrgId, setActiveInvOrgId] = useState<string | null>(null);
    const [activeLedgerId, setActiveLedgerId] = useState<string | null>(null);

    const { setLegalEntity, setBusinessUnit } = useEnterpriseStore();

    // Fetch the user's data access mapping from the backend
    const { data: accessData, isLoading } = useQuery<UserDataAccess[]>({
        queryKey: ["/api/enterprise/user-data-access"],
        queryFn: () => fetch("/api/enterprise/user-data-access").then(res => res.json()),
        enabled: !!user, // Only fetch if user is logged in
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Automatically set default contexts when data loads
    useEffect(() => {
        if (accessData && accessData.length > 0) {
            const defaultBu = accessData.find(a => a.contextType === 'BU' && a.isDefault) || accessData.find(a => a.contextType === 'BU');
            const defaultLe = accessData.find(a => a.contextType === 'LE' && a.isDefault) || accessData.find(a => a.contextType === 'LE');
            const defaultInvOrg = accessData.find(a => a.contextType === 'INV_ORG' && a.isDefault) || accessData.find(a => a.contextType === 'INV_ORG');
            const defaultLedger = accessData.find(a => a.contextType === 'LEDGER' && a.isDefault) || accessData.find(a => a.contextType === 'LEDGER');

            if (!activeBuId && defaultBu) setActiveBuId(defaultBu.contextValue);
            if (!activeLeId && defaultLe) setActiveLeId(defaultLe.contextValue);
            if (!activeInvOrgId && defaultInvOrg) setActiveInvOrgId(defaultInvOrg.contextValue);
            if (!activeLedgerId && defaultLedger) setActiveLedgerId(defaultLedger.contextValue);
        }
    }, [accessData]);

    // Optionally load saved context from localStorage
    useEffect(() => {
        const savedBu = localStorage.getItem('nexus_active_bu');
        const savedLe = localStorage.getItem('nexus_active_le');
        if (savedBu) setActiveBuId(savedBu);
        if (savedLe) setActiveLeId(savedLe);
    }, []);

    const setActiveContext = (type: ContextType, id: string | null) => {
        let changed = false;
        switch (type) {
            case 'BU':
                if (activeBuId !== id) {
                    setActiveBuId(id);
                    setBusinessUnit(id);
                    if (id) localStorage.setItem('nexus_active_bu', id);
                    else localStorage.removeItem('nexus_active_bu');

                    // Clear child: INV_ORG
                    setActiveInvOrgId(null);

                    changed = true;
                }
                break;
            case 'LE':
                if (activeLeId !== id) {
                    setActiveLeId(id);
                    setLegalEntity(id);
                    if (id) localStorage.setItem('nexus_active_le', id);
                    else localStorage.removeItem('nexus_active_le');

                    // Clear children: BU, INV_ORG
                    setActiveBuId(null);
                    setBusinessUnit(null);
                    localStorage.removeItem('nexus_active_bu');
                    setActiveInvOrgId(null);

                    changed = true;
                }
                break;
            case 'INV_ORG':
                if (activeInvOrgId !== id) {
                    setActiveInvOrgId(id);
                    changed = true;
                }
                break;
            case 'LEDGER':
                if (activeLedgerId !== id) {
                    setActiveLedgerId(id);

                    // Clear children: LE, BU, INV_ORG
                    setActiveLeId(null);
                    setLegalEntity(null);
                    localStorage.removeItem('nexus_active_le');
                    setActiveBuId(null);
                    setBusinessUnit(null);
                    localStorage.removeItem('nexus_active_bu');
                    setActiveInvOrgId(null);

                    changed = true;
                }
                break;
        }

        if (changed) {
            queryClient.invalidateQueries();
        }
    };

    return (
        <EnterpriseContext.Provider
            value={{
                activeBuId,
                activeLeId,
                activeInvOrgId,
                activeLedgerId,
                availableAccess: accessData || [],
                isLoading,
                setActiveContext
            }}
        >
            {children}
        </EnterpriseContext.Provider>
    );
}

export function useEnterprise() {
    const context = useContext(EnterpriseContext);
    if (context === undefined) {
        throw new Error("useEnterprise must be used within an EnterpriseProvider");
    }
    return context;
}
