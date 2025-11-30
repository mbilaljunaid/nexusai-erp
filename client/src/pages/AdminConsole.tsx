import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";

export default function AdminConsole() {
  const { data: users = [] } = useQuery<any[]>({ queryKey: ["/api/admin/users"] });
  const { data: roles = [] } = useQuery<any[]>({ queryKey: ["/api/admin/roles"] });
  const activeUsers = users.filter((u: any) => u.status === "active").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Settings className="w-8 h-8" />Admin Console</h1>
        <p className="text-muted-foreground">System administration and configuration</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Users</p><p className="text-2xl font-bold">{users.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Active</p><p className="text-2xl font-bold text-green-600">{activeUsers}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Roles</p><p className="text-2xl font-bold">{roles.length}</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Users</CardTitle></CardHeader><CardContent><div className="space-y-2">{users.map((u: any) => (<div key={u.id} className="flex justify-between items-center p-3 border rounded hover-elevate"><div><p className="font-semibold">{u.name}</p><p className="text-sm text-muted-foreground">{u.email}</p></div><Badge variant={u.status === "active" ? "default" : "secondary"}>{u.role}</Badge></div>))}</div></CardContent></Card>
    </div>
  );
}
