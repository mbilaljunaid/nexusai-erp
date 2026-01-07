import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

export default function PackagingTraceability() {
  const { data: labels = [], isLoading } = useQuery({
    queryKey: ["/api/fb-labels"],
    queryFn: () => fetch("/api/fb-labels").then(r => r.json()).catch(() => []),
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Tag className="h-8 w-8" />
          Packaging, Labeling & Traceability
        </h1>
        <p className="text-muted-foreground mt-2">Label templates, batch serialization, shelf life calculation, and batch tracking</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Labels</p>
            <p className="text-2xl font-bold">{labels.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Templates</p>
            <p className="text-2xl font-bold">{new Set(labels.map((l: any) => l.templateId)).size}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Barcodes</p>
            <p className="text-2xl font-bold">{labels.filter((l: any) => l.barcode).length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">QR Codes</p>
            <p className="text-2xl font-bold">{labels.filter((l: any) => l.qrCode).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Labels</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : labels.length === 0 ? <p className="text-muted-foreground text-center py-4">No labels</p> : labels.slice(0, 10).map((l: any) => (
            <div key={l.id} className="p-2 border rounded text-sm hover-elevate" data-testid={`label-${l.id}`}>
              <p className="font-semibold">{l.batchId}</p>
              <p className="text-xs text-muted-foreground">Barcode: {l.barcode || "N/A"} • Expiry: {l.expiryDate}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
