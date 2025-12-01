import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function GoodsReceiptPage() {
  const receipts = [
    { id: "gr1", number: "GR-2025-001", po: "PO-001", vendor: "Acme Supplies", items: 50, status: "received", inspection: "passed", date: "Nov 30, 2025" }
    { id: "gr2", number: "GR-2025-002", po: "PO-002", vendor: "Global Parts", items: 120, status: "received", inspection: "in-progress", date: "Nov 29, 2025" }
    { id: "gr3", number: "GR-2025-003", po: "PO-003", vendor: "TechVendor", items: 35, status: "partial", inspection: "failed", date: "Nov 28, 2025" }
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CheckCircle className="h-8 w-8" />
          Goods Receipt
        </h1>
        <p className="text-muted-foreground mt-2">Receive and inspect delivered goods</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Receipts</p>
            <p className="text-2xl font-bold">{receipts.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Received</p>
            <p className="text-2xl font-bold text-green-600">{receipts.filter(r => r.status === "received").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">In Inspection</p>
            <p className="text-2xl font-bold text-yellow-600">1</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Failed QC</p>
            <p className="text-2xl font-bold text-red-600">1</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Receipts</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {receipts.map((receipt) => (
            <div key={receipt.id} className="p-3 border rounded-lg hover-elevate" data-testid={`gr-${receipt.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{receipt.number}</h3>
                <div className="flex gap-2">
                  <Badge variant={receipt.inspection === "passed" ? "default" : receipt.inspection === "failed" ? "destructive" : "secondary"}>{receipt.inspection}</Badge>
                  <Badge variant="secondary">{receipt.status}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">PO: {receipt.po} • Vendor: {receipt.vendor} • Items: {receipt.items} • Date: {receipt.date}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
