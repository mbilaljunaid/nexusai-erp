import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtered, setFiltered] = useState<any[]>([]);
  const { data: users = [] } = useQuery<any[]>({ queryKey: ["/api/users"] });
  const formMetadata = getFormMetadata("userManagement");

  return (
    <div className="space-y-6 p-4">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Master</h1>
          <p className="text-muted-foreground mt-2">Manage employees, system identities, and access control</p>
        </div>
        <SmartAddButton formMetadata={formMetadata} onClick={() => {}} />
      </div>

      <FormSearchWithMetadata formMetadata={formMetadata} value={searchQuery} onChange={setSearchQuery} data={users} onFilter={setFiltered} />

      <Card>
        <CardHeader><CardTitle className="text-base">Users</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {filtered.length > 0 ? filtered.map((user: any) => (
            <div key={user.id} className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Badge>{user.role}</Badge>
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1" data-testid="button-cancel-user">Cancel</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4"><CardContent className="pt-0"><p className="text-sm text-muted-foreground">Total Users</p><p className="text-2xl font-bold">{users.length}</p></CardContent></Card>
        <Card className="p-4"><CardContent className="pt-0"><p className="text-sm text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">{users.filter(u => u.status === "active").length}</p></CardContent></Card>
        <Card className="p-4"><CardContent className="pt-0"><p className="text-sm text-muted-foreground">MFA Enabled</p><p className="text-2xl font-bold text-blue-600">{users.filter(u => u.mfa).length}</p></CardContent></Card>
        <Card className="p-4"><CardContent className="pt-0"><p className="text-sm text-muted-foreground">Inactive</p><p className="text-2xl font-bold text-orange-600">{users.filter(u => u.status === "inactive").length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users & Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate" data-testid={`user-row-${user.id}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.name}</span>
                    {user.mfa && <Badge className="text-xs">MFA</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {user.email} • {user.employeeId} • {user.dept} (Reports to: {user.manager})
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                  <Badge variant="outline" className="text-xs">{user.role}</Badge>
                  <Button size="icon" variant="ghost" onClick={() => handleDeactivate(user.id)} data-testid={`button-toggle-${user.id}`}>
                    {user.status === "active" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
