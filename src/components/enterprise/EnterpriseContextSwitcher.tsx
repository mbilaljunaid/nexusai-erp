/**
 * EnterpriseContextSwitcher
 *
 * A reusable dropdown that lets the user pick an active enterprise scope
 * (Business Unit, Inventory Org, or SetID). The chosen value is passed
 * back to the parent via onChange so the parent can stamp it as an HTTP
 * request header on subsequent API calls.
 *
 * Usage:
 *   <EnterpriseContextSwitcher
 *     type="business-unit"          // 'business-unit' | 'inventory-org' | 'set'
 *     value={activeBuId}
 *     onChange={setActiveBuId}
 *   />
 */

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Warehouse, Globe, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ScopeType = "business-unit" | "inventory-org" | "set" | "legal-entity" | "ledger";

interface Props {
    type: ScopeType;
    value: string | undefined;
    onChange: (id: string | undefined) => void;
    className?: string;
}

const META: Record<ScopeType, { label: string; apiPath: string; icon: React.ElementType; headerKey: string; color: string }> = {
    "business-unit": {
        label: "Business Unit",
        apiPath: "/api/enterprise/business-units",
        icon: Building2,
        headerKey: "x-business-unit-id",
        color: "bg-blue-500/15 text-blue-700 border-blue-200",
    },
    "inventory-org": {
        label: "Inventory Org",
        apiPath: "/api/enterprise/inventory-orgs",
        icon: Warehouse,
        headerKey: "x-inventory-org-id",
        color: "bg-emerald-500/15 text-emerald-700 border-emerald-200",
    },
    "set": {
        label: "Reference Set",
        apiPath: "/api/enterprise/reference-sets",
        icon: Globe,
        headerKey: "x-set-id",
        color: "bg-violet-500/15 text-violet-700 border-violet-200",
    },
    "legal-entity": {
        label: "Legal Entity",
        apiPath: "/api/enterprise/legal-entities",
        icon: Building2,
        headerKey: "x-legal-entity-id",
        color: "bg-amber-500/15 text-amber-700 border-amber-200",
    },
    "ledger": {
        label: "Ledger",
        apiPath: "/api/gl/ledgers",
        icon: Globe,
        headerKey: "x-ledger-id",
        color: "bg-indigo-500/15 text-indigo-700 border-indigo-200",
    },
};

export function EnterpriseContextSwitcher({ type, value, onChange, className }: Props) {
    const meta = META[type];
    const Icon = meta.icon;

    const { data: items = [] } = useQuery<any[]>({
        queryKey: [meta.apiPath],
        // Silently ignore errors — context list is non-critical
        meta: { errorBehavior: "silent" },
        select: (d) => (Array.isArray(d) ? d : []),
        retry: false,
    });

    const activeItem = items.find((i) => i.id === value);
    const activeLabel = activeItem?.name || activeItem?.code || value || "All";

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <span className="text-xs font-medium text-muted-foreground hidden sm:block">{meta.label}:</span>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 pl-2.5 pr-2"
                        id={`ctx-switcher-${type}`}
                    >
                        <Icon className="h-3.5 w-3.5" />
                        <Badge
                            variant="outline"
                            className={cn("text-xs px-1.5 py-0 font-medium", meta.color)}
                        >
                            {activeLabel}
                        </Badge>
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel className="text-xs">{meta.label}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-sm"
                        onClick={() => onChange(undefined)}
                    >
                        <span className="font-medium">All</span>
                        <span className="ml-auto text-xs text-muted-foreground">(no filter)</span>
                    </DropdownMenuItem>
                    {items.map((item) => (
                        <DropdownMenuItem
                            key={item.id}
                            className="text-sm"
                            onClick={() => onChange(item.id)}
                        >
                            <span className={cn(item.id === value && "font-semibold")}>
                                {item.name || item.code || item.id}
                            </span>
                            {item.code && item.name && (
                                <span className="ml-auto text-xs text-muted-foreground">{item.code}</span>
                            )}
                        </DropdownMenuItem>
                    ))}
                    {items.length === 0 && (
                        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                            No {meta.label.toLowerCase()}s configured
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

/** Build fetch headers from active scoping context */
export function buildScopeHeaders(scopes: Partial<Record<ScopeType, string | undefined>>): Record<string, string> {
    const headers: Record<string, string> = {};
    if (scopes["business-unit"]) headers["x-business-unit-id"] = scopes["business-unit"];
    if (scopes["inventory-org"]) headers["x-inventory-org-id"] = scopes["inventory-org"];
    if (scopes["set"]) headers["x-set-id"] = scopes["set"];
    if (scopes["legal-entity"]) headers["x-legal-entity-id"] = scopes["legal-entity"];
    if (scopes["ledger"]) headers["x-ledger-id"] = scopes["ledger"];
    return headers;
}
