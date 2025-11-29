import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PermissionMatrix() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Permission Matrix</h1>
        <p className="text-muted-foreground mt-1">View and manage role-based permissions</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Permission Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Module</th>
                  <th className="text-left p-2">Admin</th>
                  <th className="text-left p-2">Manager</th>
                  <th className="text-left p-2">User</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { module: "Leads", admin: "✓", manager: "✓", user: "✓" },
                  { module: "Deals", admin: "✓", manager: "✓", user: "○" },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2">{row.module}</td>
                    <td className="p-2">{row.admin}</td>
                    <td className="p-2">{row.manager}</td>
                    <td className="p-2">{row.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
