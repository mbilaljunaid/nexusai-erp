import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Edit2, Shield } from "lucide-react";
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
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Partial<Role> | null>(null);

  // Mock data since API might be sparse
  const roles: Role[] = [
    { id: "1", name: "Administrator", permissions: 150, users: 2, description: "Full system access" },
    { id: "2", name: "Manager", permissions: 80, users: 5, description: "Approvals and reporting" },
    { id: "3", name: "User", permissions: 20, users: 120, description: "Basic access" },
  ];

  const mutation = useMutation({
    mutationFn: async (data: Partial<Role>) => {
      // Mock
      return {};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setIsSheetOpen(false);
      setEditingRole(null);
      toast({ title: "Success", description: "Role saved successfully" });
    }
  });

  const columns: Column<Role>[] = [
    { header: "Role Name", accessorKey: "name", cell: (row: Role) => <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-muted-foreground" /><span className="font-semibold">{row.name}</span></div> },
    { header: "Description", accessorKey: "description" },
    { header: "Users", accessorKey: "users", cell: (row: Role) => <span className="font-mono">{row.users}</span> },
    { header: "Permissions", accessorKey: "permissions", cell: (row: Role) => <span className="font-mono">{row.permissions}</span> },
    {
      header: "Actions", id: "actions", cell: (row: Role) => (
        <Button variant="ghost" size="sm" onClick={() => { setEditingRole(row); setIsSheetOpen(true); }}>
          <Edit2 className="h-4 w-4" />
        </Button>
      )
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({});
  };

  return (
    <StandardPage
      title="Role Management"
      description="Define roles, permissions, and access levels"
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Roles" }]}
      actions={
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={() => setEditingRole(null)}>
              <Plus className="mr-2 h-4 w-4" /> New Role
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{editingRole ? 'Edit' : 'Create'} Role</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input id="name" defaultValue={editingRole?.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Input id="desc" defaultValue={editingRole?.description} />
              </div>
              <Button type="submit" className="w-full">
                Save Role
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      }
    >
      <StandardTable
        data={roles}
        columns={columns}
        isLoading={false}
        keyExtractor={(item) => item.id}
        filterColumn="name"
        filterPlaceholder="Filter roles..."
      />
    </StandardPage>
  );
}
