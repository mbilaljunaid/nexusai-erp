import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Landmark, Users, Briefcase, ShieldCheck, FileText, Activity } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function GovernmentPage() {
  const { data = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/government-default'],
    queryFn: () => fetch("/api/government-default").then(r => r.json()).catch(() => []),
  });

  return (
    <StandardDashboard
      header={
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Government & Public Sector</h1>
          <p className="text-muted-foreground mt-1">Citizen services orchestration, public treasury management, and multi-agency regulatory reporting</p>
        </div>
      }
    >
      <DashboardWidget title="Citizen Engagement" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-blue-100/50">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{data.length}</div>
            <p className="text-xs text-muted-foreground">Active Case Files</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Treasury Reserve" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-emerald-100/50">
            <Landmark className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">$1.2B</div>
            <p className="text-xs text-muted-foreground">Budget appropriation</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Agency Status" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-indigo-100/50">
            <Briefcase className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-indigo-600">Secure</div>
            <p className="text-xs text-muted-foreground">Domain integrity</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Audit Compliance" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-amber-100/50">
            <ShieldCheck className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-amber-600">ISO 27001</div>
            <p className="text-xs text-muted-foreground">Regulatory standard</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget
        colSpan={4}
        title="Public Sector Registry"
        icon={FileText}
        action={<Button size="sm"><Plus className="w-4 h-4 mr-2" />File Record</Button>}
      >
        <div className="space-y-3">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : data.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 font-medium">No official records staged in the active partition</p>
          ) : (
            data.map((item: any, idx: number) => (
              <div key={item.id || idx} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4" data-testid={`card-item-${item.id || idx}`}>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{item.name || item.citizenName || item.caseId || item.id}</p>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-tighter">
                      GOV-ID: {item.id}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Class: {item.type || item.serviceType || "General Agency"} •
                    Funding: {item.amount || item.budget || "N/A"} allocation units
                  </p>
                </div>
                <div className="flex flex-row items-center gap-3">
                  <Badge variant={item.status === "Active" ? "default" : "secondary"} className="text-[10px] uppercase font-mono">
                    {item.status || "Authenticated"}
                  </Badge>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
                    <Activity className="w-3 h-3" />
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
