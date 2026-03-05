import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch } from "lucide-react";

export default function BatchTraceabilityGeology() {
  const { data: traces = [], isLoading } = useQuery<any>({
    queryKey: ["/api/batch-genealogy"],
    queryFn: () => fetch("/api/batch-genealogy").then(r => r.json()),
  });

  const recalled = traces.filter((t: any) => t.recallFlag).length;

  return (
    <StandardPage
      title="Batch Trace"
      description="Parent/child batch links, raw material sourcing, and recall management"
    >

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Records</p>
            <p className="text-2xl font-bold">{traces.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active Batches</p>
            <p className="text-2xl font-bold text-green-600">{traces.filter((t: any) => !t.recallFlag).length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Under Recall</p>
            <p className="text-2xl font-bold text-red-600">{recalled}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Traceability Rate</p>
            <p className="text-2xl font-bold">{traces.length > 0 ? ((traces.filter((t: any) => t.traceabilityComplete).length / traces.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Batch Genealogy</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : traces.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : traces.map((t: any) => (
            <div key={t.id} className="p-3 border rounded hover-elevate" data-testid={`trace-${t.id}`}>
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-sm">{t.parentBatchId || "Batch"}</p>
                <div className="flex gap-1">
                  {t.recallFlag && <Badge variant="destructive" className="text-xs">RECALLED</Badge>}
                  <Badge variant={t.traceabilityComplete ? "default" : "secondary"} className="text-xs">{t.traceabilityComplete ? "Complete" : "Partial"}</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Children: {t.childBatches || 0} • Materials: {t.rawMaterialSources || 0}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </StandardPage>
  );
}
