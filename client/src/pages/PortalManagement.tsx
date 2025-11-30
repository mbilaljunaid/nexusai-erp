import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default function PortalManagement() {
  const portals = [
    { id: "pt1", name: "Customer Portal", type: "External", users: 1200, status: "active" },
    { id: "pt2", name: "Vendor Portal", type: "External", users: 450, status: "active" },
    { id: "pt3", name: "Employee Portal", type: "Internal", users: 150, status: "active" },
  ];
  return (
    <div className="space-y-6 p-4">
      <div><h1 className="text-3xl font-bold flex items-center gap-2"><Users className="h-8 w-8" />Portal Management</h1><p className="text-muted-foreground mt-2">Manage customer, vendor, and employee portals</p></div>
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Portals</p><p className="text-2xl font-bold">3</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Users</p><p className="text-2xl font-bold">1.8K</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Active Sessions</p><p className="text-2xl font-bold text-blue-600">420</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Uptime</p><p className="text-2xl font-bold">99.9%</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">Portal Status</CardTitle></CardHeader><CardContent className="space-y-3">{portals.map((p) => (<div key={p.id} className="p-3 border rounded-lg hover-elevate" data-testid={`portal-${p.id}`}><div className="flex justify-between mb-2"><h3 className="font-semibold">{p.name}</h3><Badge>{p.type}</Badge></div><p className="text-sm text-muted-foreground">Users: {p.users} • Status: {p.status}</p></div>))}</CardContent></Card>
    </div>
  );
}
