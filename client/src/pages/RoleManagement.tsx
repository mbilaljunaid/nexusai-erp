import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function RoleManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground mt-1">Define roles and permissions</p>
        </div>
        <Button data-testid="button-new-role"><Plus className="h-4 w-4 mr-2" />New Role</Button>
      </div>
      <div className="grid gap-4">
        {[
          { name: "Administrator", permissions: 150, users: 2 }
          { name: "Sales Manager", permissions: 45, users: 8 }
        ].map((role) => (
          <Card key={role.name}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{role.name}</h3>
              <p className="text-sm text-muted-foreground">{role.permissions} permissions • {role.users} users</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
