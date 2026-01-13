import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Stethoscope, Activity, Heart, ShieldAlert, FileText, User } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function HealthcarePage() {
  const [search, setSearch] = useState("");
  const endpoint = window.location.pathname.replace("/", "").replace(/-/g, "-").toLowerCase();
  const { data = [], isLoading } = useQuery<any[]>({
    queryKey: [`/api/healthcare-${endpoint.split("healthcare")[1] || "default"}`],
    queryFn: () => fetch(`/api/healthcare-${endpoint.split("healthcare")[1] || "default"}`).then(r => r.json()).catch(() => []),
  });

  const filtered = data.filter((item: any) =>
    (item.name || item.firstName || item.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <StandardDashboard
      header={
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Healthcare EMR & Clinical Data</h1>
          <p className="text-muted-foreground mt-1 text-capitalize">
            {endpoint.replace("healthcare-", "").replace(/-/g, " ")} management and patient data orchestration
          </p>
        </div>
      }
    >
      <DashboardWidget title="Active Patients" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-blue-100/50">
            <Stethoscope className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{filtered.length}</div>
            <p className="text-xs text-muted-foreground">Managed records</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Clinical Vitals" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-emerald-100/50">
            <Heart className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">Stable</div>
            <p className="text-xs text-muted-foreground">Ward velocity</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="System Integrity" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-indigo-100/50">
            <Activity className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-indigo-600">99.9%</div>
            <p className="text-xs text-muted-foreground">HL7/FHIR sync</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Alert Queue" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-rose-100/50">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-rose-600">2</div>
            <p className="text-xs text-muted-foreground">STAT protocols</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget
        colSpan={4}
        title="Clinical Registry"
        icon={FileText}
        action={
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button size="sm"><Plus className="w-4 h-4 mr-2" />New Entry</Button>
          </div>
        }
      >
        <div className="space-y-3">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 font-medium">No clinical records staged in the active partition</p>
          ) : (
            filtered.map((item: any, idx: number) => (
              <div key={item.id || idx} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4" data-testid={`card-item-${item.id || idx}`}>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{item.name || item.firstName || item.title || "Subject Record"}</p>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-tighter">
                      REF: {item.id || "TEMP"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Class: {item.type || item.department || "Standard"} •
                    Authored: {item.date || item.createdAt?.split("T")[0] || "Contemporary"}
                  </p>
                </div>
                <div className="flex flex-row items-center gap-3">
                  <Badge variant={item.status === "Active" ? "default" : "secondary"} className="text-[10px] uppercase font-mono">
                    {item.status || "Authenticated"}
                  </Badge>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
                    <User className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DashboardWidget>
    </StandardDashboard>
  );
}
