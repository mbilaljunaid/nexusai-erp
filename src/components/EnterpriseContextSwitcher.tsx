import { useEnterprise } from "@/contexts/EnterpriseContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Building2, Factory, Scale, FileSpreadsheet } from "lucide-react";
import { Label } from "./ui/label";

export function EnterpriseContextSwitcher() {
    const {
        activeBuId, setActiveContext, availableAccess,
        activeLeId, activeInvOrgId, activeLedgerId
    } = useEnterprise();

    // Filter access by type
    const buAccess = availableAccess.filter(a => a.contextType === 'BU');
    const leAccess = availableAccess.filter(a => a.contextType === 'LE');
    const invAccess = availableAccess.filter(a => a.contextType === 'INV_ORG');
    const ledgerAccess = availableAccess.filter(a => a.contextType === 'LEDGER');

    // If user has no enterprise contexts assigned, don't show the switcher
    if (availableAccess.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-4 text-sm">
            {buAccess.length > 0 && (
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <Select value={activeBuId || undefined} onValueChange={(v) => setActiveContext('BU', v)}>
                        <SelectTrigger className="w-[180px] h-8 bg-black/40 border-slate-700/50">
                            <SelectValue placeholder="Select Business Unit" />
                        </SelectTrigger>
                        <SelectContent>
                            {buAccess.map(access => (
                                <SelectItem key={access.id} value={access.contextValue}>
                                    {access.contextValue} {/* In a real app we would join with names */}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {leAccess.length > 0 && (
                <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-muted-foreground" />
                    <Select value={activeLeId || undefined} onValueChange={(v) => setActiveContext('LE', v)}>
                        <SelectTrigger className="w-[180px] h-8 bg-black/40 border-slate-700/50">
                            <SelectValue placeholder="Select Legal Entity" />
                        </SelectTrigger>
                        <SelectContent>
                            {leAccess.map(access => (
                                <SelectItem key={access.id} value={access.contextValue}>
                                    {access.contextValue}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {invAccess.length > 0 && (
                <div className="flex items-center gap-2">
                    <Factory className="h-4 w-4 text-muted-foreground" />
                    <Select value={activeInvOrgId || undefined} onValueChange={(v) => setActiveContext('INV_ORG', v)}>
                        <SelectTrigger className="w-[180px] h-8 bg-black/40 border-slate-700/50">
                            <SelectValue placeholder="Select Inventory Org" />
                        </SelectTrigger>
                        <SelectContent>
                            {invAccess.map(access => (
                                <SelectItem key={access.id} value={access.contextValue}>
                                    {access.contextValue}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
}
