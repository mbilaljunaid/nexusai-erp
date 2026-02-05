import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Car, Factory, Gauge, History, Settings, Activity } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function AutomotivePage() {
  const { data = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/automotive-default'],
    queryFn: () => fetch("/api/automotive-default").then(r => r.json()).catch(() => []),
  });

  return (
    <StandardDashboard
      header={
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Automotive Production & Assembly</h1>
          <p className="text-muted-foreground mt-1">Real-time shop floor orchestration, assembly line monitoring, and build-to-order logic</p>
        </div>
      }
    >
      <DashboardWidget title="Units in Production" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-blue-100/50">
            <Car className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{data.length}</div>
            <p className="text-xs text-muted-foreground">Active Build Slots</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Line Throughput" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-emerald-100/50">
            <Gauge className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">94.2%</div>
            <p className="text-xs text-muted-foreground">OEE Efficiency</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Assembly Status" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-indigo-100/50">
            <Factory className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-indigo-600">Online</div>
            <p className="text-xs text-muted-foreground">Facility Response</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Quality Log" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-amber-100/50">
            <History className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-amber-600">Pass</div>
            <p className="text-xs text-muted-foreground">Final Gate Audit</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget
        colSpan={4}
        title="Production Manifest"
        icon={Settings}
        action={<Button size="sm"><Plus className="w-4 h-4 mr-2" />Initiate Build</Button>}
      >
        <div className="space-y-3">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : data.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 font-medium">No production orders staged in the contemporary window</p>
          ) : (
            data.map((item: any, idx: number) => (
              <div key={item.id || idx} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4" data-testid={`card-item-${item.id || idx}`}>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{item.name || item.modelName || item.vehicleId || item.id}</p>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-tighter">
                      VIN: {item.id}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Spec: {item.type || item.category || "Standard"} •
                    Valuation: ${parseFloat(item.price || item.inventory || 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-row items-center gap-3">
                  <Badge variant={item.status === "Active" ? "default" : "secondary"} className="text-[10px] uppercase font-mono">
                    {item.status || "In Progress"}
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
