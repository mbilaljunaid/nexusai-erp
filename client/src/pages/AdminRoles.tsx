import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { queryClient } from "@/lib/queryClient";
import { Plus, Trash2 } from "lucide-react";

const PERMISSIONS = [
  { id: "read", label: "Read" },
  { id: "write", label: "Write" },
  { id: "delete", label: "Delete" },
  { id: "admin", label: "Admin" }
];

export default function AdminRoles() {
  const [newRole, setNewRole] = useState({ name: "", permissions: [] as string[] });
  const [searchQuery, setSearchQuery] = useState("");
  const [filtered, setFiltered] = useState<any[]>([]);
  const tenantId = "tenant1";
  const formMetadata = getFormMetadata("adminRoles");

  const { data: roles = [] } = useQuery({
    queryKey: ["/api/roles", tenantId],
    queryFn: () => fetch(`/api/roles?tenantId=${tenantId}`).then(r => r.json())
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => 
      fetch("/api/roles", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ ...data, tenantId })
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles", tenantId] });
      setNewRole({ name: "", permissions: [] });
    }
  });

  const togglePermission = (perm: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Role Management</h1>
        <p className="text-gray-600">Create and manage user roles with permissions</p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Role</h2>
        <div className="space-y-4">
          <Input 
            placeholder="Role Name (e.g., Manager, Operator)" 
            value={newRole.name}
            onChange={e => setNewRole({...newRole, name: e.target.value})}
            data-testid="input-role-name"
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Permissions</label>
            <div className="space-y-2">
              {PERMISSIONS.map(perm => (
                <div key={perm.id} className="flex items-center gap-2">
                  <Checkbox 
                    id={perm.id}
                    checked={newRole.permissions.includes(perm.id)}
                    onCheckedChange={() => togglePermission(perm.id)}
                    data-testid={`checkbox-perm-${perm.id}`}
                  />
                  <label htmlFor={perm.id} className="text-sm cursor-pointer">{perm.label}</label>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={() => createMutation.mutate(newRole)}
            disabled={!newRole.name || newRole.permissions.length === 0 || createMutation.isPending}
            data-testid="button-create-role"
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            {createMutation.isPending ? "Creating..." : "Create Role"}
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Roles ({roles.length})</h2>
        <div className="grid gap-4">
          {roles.map((role: any) => (
            <Card key={role.id} className="p-4 hover-elevate">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg" data-testid={`text-role-${role.id}`}>{role.name}</h3>
                  <div className="flex gap-2 mt-2">
                    {role.permissions.map((perm: string) => (
                      <span key={perm} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                  {role.status}
                </span>
              </div>
            </Card>
          ))}
          {roles.length === 0 && (
            <Card className="p-8 text-center text-gray-500">
              <p>No roles yet. Create one to get started.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
