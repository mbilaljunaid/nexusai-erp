import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function UserManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage system users and access</p>
        </div>
        <Button data-testid="button-add-user"><Plus className="h-4 w-4 mr-2" />Add User</Button>
      </div>
      <div className="grid gap-4">
        {[
          { name: "Alice Admin", role: "Administrator", status: "Active" },
          { name: "Bob User", role: "User", status: "Active" },
        ].map((user) => (
          <Card key={user.name}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.role}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
