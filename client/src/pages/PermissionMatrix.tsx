import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PermissionMatrix() {
  const modules = ["CRM", "ERP", "HR", "Finance", "Projects", "Analytics", "Service", "Marketing"];
  const roles = ["Admin", "Manager", "Supervisor", "Operator", "Viewer"];
  const actions = ["Create", "Read", "Update", "Delete", "Approve", "Export"];
  
  const permissions = {
    "CRM": { Admin: "✓✓✓✓✓✓", Manager: "✓✓✓○✓✓", Supervisor: "✓✓✓○○✓", Operator: "✓✓○○○✓", Viewer: "✓○○○○○" },
    "ERP": { Admin: "✓✓✓✓✓✓", Manager: "✓✓✓✓✓✓", Supervisor: "✓✓✓○○✓", Operator: "✓✓○○○○", Viewer: "✓○○○○○" },
    "Finance": { Admin: "✓✓✓✓✓✓", Manager: "✓✓✓✓✓✓", Supervisor: "✓✓✓✓○✓", Operator: "✓✓○○○✓", Viewer: "✓○○○○○" },
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">Permission Matrix</h1>
        <p className="text-muted-foreground mt-1">CRUD + Actions (Create/Read/Update/Delete/Approve/Export)</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Module Access by Role</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="text-left p-2 font-bold">Module</th>
                  {roles.map(role => <th key={role} className="text-left p-2">{role}</th>)}
                </tr>
              </thead>
              <tbody>
                {Object.entries(permissions).map(([module, rolePerms]) => (
                  <tr key={module} className="border-b hover-elevate">
                    <td className="p-2 font-medium">{module}</td>
                    {roles.map(role => (
                      <td key={`${module}-${role}`} className="p-2" data-testid={`perm-${module}-${role}`}>
                        <div className="flex gap-0.5">
                          {(rolePerms[role as keyof typeof rolePerms] || "").split("").map((mark, i) => (
                            <Badge key={i} variant={mark === "✓" ? "default" : "secondary"} className="text-xs px-1">
                              {mark}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Legend: ✓ = Allowed | ○ = Restricted | Actions: C/R/U/D/A/E</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
