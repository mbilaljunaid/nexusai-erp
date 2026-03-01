import React from "react";
import { useLedger } from "@/context/LedgerContext";
import { Badge } from "@/components/ui/badge";

export function LedgerContextBadge() {
    const { activeLedger } = useLedger();

    if (!activeLedger) return null;

    // For now we'll just show the ledger name. In a real app the period would be tracked contextually too.
    return (
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 shrink-0">
            Ledger: {activeLedger.name}
        </Badge>
    );
}
