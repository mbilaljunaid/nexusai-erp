import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContextualSearch } from "@/components/ContextualSearch";
import { generateBreadcrumbs, getSearchFields } from "@/lib/pageConfig";

export default function AdminUsersDetail() {
  const [searchFilters, setSearchFilters] = useState<Record<string, string>>({});
  const [users] = useState([
    { id: 1, name: "Alice Admin", status: "active", role: "admin" },
    { id: 2, name: "Bob User", status: "active", role: "user" },
  ]);

  const filteredUsers = users.filter((u) => {
    if (searchFilters.name && !u.name.toLowerCase().includes(searchFilters.name.toLowerCase())) return false;
    if (searchFilters.status && u.status !== searchFilters.status) return false;
    if (searchFilters.role && !u.role.toLowerCase().includes(searchFilters.role.toLowerCase())) return false;
    return true;
  });

  const breadcrumbs = generateBreadcrumbs("Admin", "Users");
  const searchFields = getSearchFields("Admin");

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">User Management</h1>
          <p className="text-muted-foreground text-sm">Manage system users</p>
        </div>
        <Button data-testid="button-new-user">
          <Plus className="h-4 w-4 mr-2" />
          New User
        </Button>
      </div>

      <ContextualSearch
        fields={searchFields}
        onSearch={setSearchFilters}
        placeholder="Search users..."
        testId="search-users"
      />

      <div className="space-y-2">
        {filteredUsers.map((u) => (
          <Card key={u.id} className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold" data-testid={`text-user-${u.id}`}>{u.name}</p>
                  <p className="text-sm text-muted-foreground">{u.role}</p>
                </div>
                <Badge variant={u.status === "active" ? "default" : "secondary"} data-testid={`badge-status-${u.id}`}>
                  {u.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
