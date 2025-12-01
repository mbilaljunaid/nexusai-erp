import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Clock, TrendingUp } from "lucide-react";

export default function StoreOperationsDashboard() {
  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["/api/stores"],
    queryFn: () => fetch("/api/stores").then(r => r.json()).catch(() => []),
  });

  const { data: staffing = [], isLoading: staffingLoading } = useQuery({
    queryKey: ["/api/store-staffing"],
    queryFn: () => fetch("/api/store-staffing").then(r => r.json()).catch(() => []),
  });

  const openStores = stores.filter((s: any) => s.status === "open").length;
  const staffCount = staffing.length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          Store Operations & Workforce
        </h1>
        <p className="text-muted-foreground mt-2">Store scheduling, staffing, shift management, and opening/closing checklists</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Stores</p>
            <p className="text-2xl font-bold">{stores.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Open</p>
                <p className="text-2xl font-bold">{openStores}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Staff Scheduled</p>
                <p className="text-2xl font-bold">{staffCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-xs text-muted-foreground">On Shift</p>
                <p className="text-2xl font-bold">{staffing.filter((s: any) => s.status === "on-shift").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Stores</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p>Loading...</p> : stores.length === 0 ? <p className="text-muted-foreground text-center py-4">No stores</p> : stores.map((s: any) => (
              <div key={s.id} className="p-2 border rounded text-sm hover-elevate" data-testid={`store-${s.id}`}>
                <p className="font-semibold">{s.name || `Store ${s.id}`}</p>
                <p className="text-xs text-muted-foreground">{s.location} • <Badge variant="default" className="text-xs">{s.status}</Badge></p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Staff Schedule</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {staffingLoading ? <p>Loading...</p> : staffing.length === 0 ? <p className="text-muted-foreground text-center py-4">No schedules</p> : staffing.map((s: any) => (
              <div key={s.id} className="p-2 border rounded text-sm hover-elevate" data-testid={`staff-${s.id}`}>
                <p className="font-semibold">{s.employeeName || "Employee"}</p>
                <p className="text-xs text-muted-foreground">{s.role} • <Badge variant={s.status === "on-shift" ? "default" : "secondary"} className="text-xs">{s.status}</Badge></p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
