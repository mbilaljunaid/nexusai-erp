import { useQuery } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Check } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  initials: string;
}

interface TenantSwitcherProps {
  currentTenant: string;
  onTenantChange?: (tenantId: string) => void;
  tenants?: Tenant[];
}

export function TenantSwitcher({ currentTenant, onTenantChange, tenants: propTenants }: TenantSwitcherProps) {
  const { data: apiTenants, isLoading } = useQuery<Tenant[]>({
    queryKey: ['/api/tenants'],
    enabled: !propTenants,
    staleTime: 60000,
  });

  const tenants = propTenants || apiTenants || [];
  const current = tenants.find(t => t.id === currentTenant) || tenants[0];

  if (isLoading && !propTenants) {
    return (
      <Button variant="ghost" size="sm" className="gap-2" disabled>
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-3 w-16 hidden md:block" />
      </Button>
    );
  }

  if (!current) {
    return null;
  }

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
