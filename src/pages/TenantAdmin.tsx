import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { queryClient } from "@/lib/queryClient";
import { Plus } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function TenantAdmin() {
  const [newTenant, setNewTenant] = useState({ name: "", slug: "" });

  const { data: tenants = [] } = useQuery<any>({
    queryKey: ["/api/tenants"],
    queryFn: () => fetch("/api/tenants").then(r => r.json())
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/tenants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      setNewTenant({ name: "", slug: "" });
    }
  });

  return (
    <StandardPage
      title="Tenant Manant Management"
      description="Manage organizational tenants and accounts"
    >

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Tenant</h2>
        <div className="space-y-4">
          <Input
            placeholder="Tenant Name"
            value={newTenant.name}
            onChange={e => setNewTenant({ ...newTenant, name: e.target.value })}
            data-testid="input-tenant-name"
          />
          <Input
            placeholder="Slug (optional)"
            value={newTenant.slug}
            onChange={e => setNewTenant({ ...newTenant, slug: e.target.value })}
            data-testid="input-tenant-slug"
          />
          <Button
            onClick={() => createMutation.mutate(newTenant)}
            disabled={!newTenant.name || createMutation.isPending}
            data-testid="button-create-tenant"
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            {createMutation.isPending ? "Creating..." : "Create Tenant"}
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Tenants ({tenants.length})</h2>
        <div className="grid gap-4">
          {tenants.map((tenant: any) => (
            <Card key={tenant.id} className="p-4 hover-elevate">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg" data-testid={`text-tenant-name-${tenant.id}`}>{tenant.name}</h3>
                  <p className="text-sm text-muted-foreground">@{tenant.slug}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{tenant.id}</p>
                </div>
                <div data-testid={`status-${tenant.id}`}>
                  <StatusBadge status={tenant.status} />
                </div>
              </div>
            </Card>
          ))}
          {tenants.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">
              <p>No tenants yet. Create one to get started.</p>
            </Card>
          )}
        </div>
      </div>
    </StandardPage>
  );
}
