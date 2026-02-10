import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Film, PlayCircle, Eye, Users, TrendingUp, Activity } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function MediaPage() {
  const { data = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/media-default'],
    queryFn: () => fetch("/api/media-default").then(r => r.json()).catch(() => []),
  });

  return (
    <StandardDashboard
      header={
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Media & Content Management</h1>
          <p className="text-muted-foreground mt-1">Digital asset lifecycle, distribution orchestration, and audience engagement analytics</p>
        </div>
      }
    >
      <DashboardWidget title="Active Library" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-blue-100/50">
            <Film className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{data.length}</div>
            <p className="text-xs text-muted-foreground">Assets indexed</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Audience Reach" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-emerald-100/50">
            <Eye className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">2.4M</div>
            <p className="text-xs text-muted-foreground">Global impressions</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Subscriber Base" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-indigo-100/50">
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-indigo-600">842K</div>
            <p className="text-xs text-muted-foreground">Active profiles</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Monetization" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-amber-100/50">
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-amber-600">$14.2M</div>
            <p className="text-xs text-muted-foreground">AdRev yield</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget
        colSpan={4}
        title="Content Catalog"
        icon={PlayCircle}
        action={<Button size="sm"><Plus className="w-4 h-4 mr-2" />Ingest Content</Button>}
      >
        <div className="space-y-3">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : data.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 font-medium">No digital assets staged in the contemporary window</p>
          ) : (
            data.map((item: any, idx: number) => (
              <div key={item.id || idx} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4" data-testid={`card-item-${item.id || idx}`}>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{item.name || item.title || item.contentId || item.id}</p>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-tighter">
                      CID: {item.id}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Format: {item.type || item.category || "Standard"} •
                    Performance: {item.revenue || item.views || item.subscribers || "0"} metric unit
                  </p>
                </div>
                <div className="flex flex-row items-center gap-3">
                  <Badge variant={item.status === "Active" ? "default" : "secondary"} className="text-[10px] uppercase font-mono">
                    {item.status || "Distribution"}
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
