import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Role {
  id: string;
  name: string;
  permissions: number;
  users: number;
  description?: string;
}

export default function RoleManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const roles: Role[] = [
    { id: "1", name: "Administrator", permissions: 150, users: 2, description: "Full system access" },
    { id: "2", name: "Manager", permissions: 80, users: 5, description: "Approvals and reporting" },
    { id: "3", name: "User", permissions: 20, users: 120, description: "Basic access" },
  ];

  const [localRoles, setLocalRoles] = useState<Role[]>(roles);

  const mutation = useMutation({
    mutationFn: async (data: Role[]) => {
      // Mock
      return {};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({ title: "Success", description: "Roles saved successfully" });
    }
  });

  const columns = [
    {
      id: "name",
      header: "Role Name *",
      width: "250px",
      cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
        <div className="flex items-center gap-2 h-full w-full px-2">
          <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Input
            className="h-9 border-0 bg-transparent focus-visible:ring-0 p-0 font-semibold w-full"
            value={row.name || ""}
            onChange={(e) => updateRow("name", e.target.value)}
            placeholder="Role Name"
          />
        </div>
      )
    },
    {
      id: "description",
      header: "Description",
      width: "350px",
      cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
        <Input
          className="h-9 border-0 bg-transparent focus-visible:ring-0 w-full"
          value={row.description || ""}
          onChange={(e) => updateRow("description", e.target.value)}
          placeholder="Role Description"
        />
      )
    },
    {
      id: "users",
      header: "Users",
      width: "120px",
      cell: (row: any) => (
        <div className="flex items-center h-full px-2 font-mono text-sm text-muted-foreground">
          {row.users || 0}
        </div>
      )
    },
    {
      id: "permissions",
      header: "Permissions",
      width: "120px",
      cell: (row: any, i: number, updateRow: (f: string, v: any) => void) => (
        <Input
          type="number"
          className="h-9 border-0 bg-transparent focus-visible:ring-0 font-mono w-full"
          value={row.permissions || 0}
          onChange={(e) => updateRow("permissions", parseInt(e.target.value) || 0)}
        />
      )
    }
  ];

  const handleAddRole = () => {
    const newRole = {
      id: `temp-${Date.now()}`,
      name: "",
      permissions: 0,
      users: 0,
      description: ""
    };
    setLocalRoles([...localRoles, newRole]);
  };

  const handleSaveRoles = () => {
    mutation.mutate(localRoles);
  };

  return (
    <StandardPage
      title="Role Management"
      description="Define roles, permissions, and access levels"
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Roles" }]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddRole}>
            <Plus className="mr-2 h-4 w-4" /> Add Role
          </Button>
          <Button onClick={handleSaveRoles} disabled={mutation.isPending}>
            Save Roles
          </Button>
        </div>
      }
    >
      <div className="bg-card w-full rounded-md border shadow-sm">
        <InteractiveSpreadsheet
          data={localRoles}
          columns={columns}
          onChange={(newData) => setLocalRoles(newData)}
          virtualized={true}
          containerHeight="600px"
        />
      </div>
    </StandardPage>
  );
}
