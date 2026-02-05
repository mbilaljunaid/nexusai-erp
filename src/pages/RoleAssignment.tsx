import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Plus } from "lucide-react";

export default function RoleAssignment() {
  const [assignments] = useState([
    { id: "a1", user: "Alice Admin", role: "System Admin", status: "active", startDate: "2025-01-15", endDate: null },
    { id: "a2", user: "Bob Manager", role: "Manager", status: "active", startDate: "2025-06-01", endDate: "2025-12-31" },
    { id: "a3", user: "Carol Operator", role: "Operator", status: "active", startDate: "2025-03-10", endDate: null },
  ]);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Role Assignment
        </h1>
        <p className="text-muted-foreground mt-2">Assign roles to users and manage assignments</p>
      </div>

      <Card className="p-4 bg-muted/50">
        <div className="grid grid-cols-3 gap-3">
          <Input placeholder="Select User" data-testid="input-assign-user" />
          <select className="border rounded px-3 py-2" data-testid="select-assign-role">
            <option>Select Role</option>
            <option>Admin</option>
            <option>Manager</option>
            <option>Operator</option>
          </select>
          <Button data-testid="button-assign-role">
            <Plus className="h-4 w-4 mr-2" />
            Assign
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate" data-testid={`assignment-${a.id}`}>
                <div>
                  <h3 className="font-medium">{a.user}</h3>
                  <p className="text-sm text-muted-foreground">Role: {a.role}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {a.startDate} → {a.endDate || "Ongoing"}
                  </p>
                </div>
                <Badge variant={a.status === "active" ? "default" : "secondary"}>{a.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
