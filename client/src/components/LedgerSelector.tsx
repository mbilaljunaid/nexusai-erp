
import React from "react";
import { useLedger } from "@/context/LedgerContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function LedgerSelector() {
    const { currentLedgerId, setCurrentLedgerId, ledgers, isLoading } = useLedger();

    if (isLoading) {
        return <Skeleton className="h-8 w-[180px]" />;
    }

    if (!ledgers || ledgers.length === 0) {
        return (
            <Badge variant="outline" className="h-8 text-muted-foreground">
                Primary Ledger
            </Badge>
        );
    }

    return (
        <Select value={currentLedgerId} onValueChange={setCurrentLedgerId}>
            <SelectTrigger className="w-[200px] h-8 border-dashed">
                <SelectValue placeholder="Select Ledger" />
            </SelectTrigger>
            <SelectContent>
                {ledgers.map((ledger) => (
                    <SelectItem key={ledger.id} value={ledger.id}>
                        {ledger.name} ({ledger.currencyCode})
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
