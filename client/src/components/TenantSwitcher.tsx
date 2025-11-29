import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, Plus, Check } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  initials: string;
}

interface TenantSwitcherProps {
  currentTenant: string;
  onTenantChange?: (tenantId: string) => void;
}

export function TenantSwitcher({ currentTenant, onTenantChange }: TenantSwitcherProps) {
  // todo: remove mock functionality
  const tenants: Tenant[] = [
    { id: "acme", name: "Acme Corp", initials: "AC" },
    { id: "techstart", name: "TechStart Inc", initials: "TI" },
    { id: "global", name: "Global Solutions", initials: "GS" },
  ];

  const current = tenants.find(t => t.id === currentTenant) || tenants[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" data-testid="button-tenant-switcher">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
              {current.initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium hidden md:inline">{current.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs uppercase tracking-wide">Your Tenants</DropdownMenuLabel>
        {tenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => onTenantChange?.(tenant.id)}
            data-testid={`menu-tenant-${tenant.id}`}
          >
            <Avatar className="h-4 w-4 mr-2">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {tenant.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{tenant.name}</span>
            {tenant.id === currentTenant && (
              <Check className="h-4 w-4 ml-auto text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs" data-testid="menu-add-tenant">
          <Plus className="h-4 w-4 mr-2" />
          Add Tenant
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
