import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StandardPage } from "@/components/layout/StandardPage";
import { Badge } from "@/components/ui/badge";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

export default function PermissionMatrix() {
  const modules = ["CRM", "ERP", "HR", "Finance", "Projects", "Analytics", "Service", "Marketing"];
  const roles = ["Admin", "Manager", "Supervisor", "Operator", "Viewer"];
  const actions = ["Create", "Read", "Update", "Delete", "Approve", "Export"];

  const permissions = {
    "CRM": { Admin: "✓✓✓✓✓✓", Manager: "✓✓✓○✓✓", Supervisor: "✓✓✓○○✓", Operator: "✓✓○○○✓", Viewer: "✓○○○○○" },
    "ERP": { Admin: "✓✓✓✓✓✓", Manager: "✓✓✓✓✓✓", Supervisor: "✓✓✓○○✓", Operator: "✓✓○○○○", Viewer: "✓○○○○○" },
    "Finance": { Admin: "✓✓✓✓✓✓", Manager: "✓✓✓✓✓✓", Supervisor: "✓✓✓✓○✓", Operator: "✓✓○○○✓", Viewer: "✓○○○○○" },
  };

  const data = Object.entries(permissions).map(([module, perms]) => ({ module, ...perms }));

  const columns: SpreadsheetColumn<any>[] = [
    { id: "module", header: "Module", width: "150px", cell: (row) => <div className="font-bold">{row.module}</div> },
    ...roles.map(role => ({
      id: role,
      header: role,
      width: "150px",
      cell: (row: any) => (
        <div className="flex gap-0.5">
          {(row[role] || "").split("").map((mark: string, i: number) => (
            <Badge key={i} variant={mark === "✓" ? "default" : "secondary"} className="text-xs px-1">
              {mark}
            </Badge>
          ))}
        </div>
      )
    }))
  ];

  return (
    <StandardPage
      title="Permission Matrix"
      description="CRUD + Actions (Create/Read/Update/Delete/Approve/Export)"
    >

      <Card>
        <CardHeader><CardTitle className="text-base">Module Access by Role</CardTitle></CardHeader>
        <CardContent>
          <div style={{ height: 400 }}>
            <InteractiveSpreadsheet
              columns={columns}
              data={data}
              onChange={() => { }}
              containerHeight="100%"
            />
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Legend: ✓ = Allowed | ○ = Restricted | Actions: C/R/U/D/A/E</p>
          </div>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
