import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EnterpriseState {
    legalEntityId: string | null;
    businessUnitId: string | null;
    inventoryOrgId: string | null;
    setLegalEntity: (id: string | null) => void;
    setBusinessUnit: (id: string | null) => void;
    setInventoryOrg: (id: string | null) => void;
    clearEnterpriseContext: () => void;
}

export const useEnterpriseStore = create<EnterpriseState>()(
    persist(
        (set) => ({
            legalEntityId: null,
            businessUnitId: null,
            inventoryOrgId: null,
            setLegalEntity: (id) => set({ legalEntityId: id }),
            setBusinessUnit: (id) => set({ businessUnitId: id }),
            setInventoryOrg: (id) => set({ inventoryOrgId: id }),
            clearEnterpriseContext: () => set({ legalEntityId: null, businessUnitId: null, inventoryOrgId: null }),
        }),
        {
            name: 'nexus-enterprise-context',
            // Persist this across reloads
        }
    )
);
