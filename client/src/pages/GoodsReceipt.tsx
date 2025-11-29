import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, FileCheck } from "lucide-react";
import { IconNavigation } from "@/components/IconNavigation";
import { Input } from "@/components/ui/input";

export default function GoodsReceipt() {
  const [activeNav, setActiveNav] = useState("list");
  const { data: grns = [] } = useQuery<any[]>({ queryKey: ["/api/procurement/goods-receipts"] });

  const navigationItems = [
    { id: "list", label: "GRNs", icon: Package, badge: grns.length },
    { id: "create", label: "Create GRN", icon: Plus },
    { id: "inspection", label: "For Inspection", icon: FileCheck, badge: grns.filter((g: any) => g.status === "received").length },
    { id: "analytics", label: "Analytics", icon: Package },
  ];

  const statusColors: Record<string, string> = {
    received: "secondary",
    inspected: "info",
    accepted: "success",
    rejected: "destructive",
    partial: "warning",
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Goods Receipt Notes (GRN)</h1>
        <p className="text-muted-foreground">Track incoming goods, perform quality checks, and match with POs</p>
      </div>

      <IconNavigation items={navigationItems} activeId={activeNav} onNavigate={setActiveNav} />

      {activeNav === "list" && (
        <div className="grid gap-4">
          {grns.map((grn: any) => (
            <Card key={grn.id} className="hover-elevate">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{grn.grnNumber}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">PO: {grn.poId}</p>
                  </div>
                  <Badge variant={statusColors[grn.status] || "default"}>{grn.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Qty</p>
                    <p className="font-semibold">{grn.totalQuantity} units</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Received Date</p>
                    <p className="font-semibold">{new Date(grn.receivedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Quality</p>
                    <Badge variant={grn.qualityStatus === "accepted" ? "default" : grn.qualityStatus === "rejected" ? "destructive" : "warning"}>
                      {grn.qualityStatus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeNav === "inspection" && (
        <div className="space-y-4">
          <p className="text-lg font-semibold">{grns.filter((g: any) => g.status === "received").length} GRNs awaiting inspection</p>
          {grns
            .filter((g: any) => g.status === "received")
            .map((grn: any) => (
              <Card key={grn.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{grn.grnNumber}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Input placeholder="Inspection Notes..." />
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <FileCheck className="w-4 h-4 mr-2" /> Accept
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1">
                        Reject
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Hold
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {activeNav === "analytics" && (
        <Card>
          <CardHeader>
            <CardTitle>GRN Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded">
                <p className="text-muted-foreground text-sm">Total GRNs</p>
                <p className="text-2xl font-bold">{grns.length}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded">
                <p className="text-muted-foreground text-sm">Received</p>
                <p className="text-2xl font-bold">{grns.filter((g: any) => g.status === "received").length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded">
                <p className="text-muted-foreground text-sm">Accepted</p>
                <p className="text-2xl font-bold">{grns.filter((g: any) => g.status === "accepted").length}</p>
              </div>
              <div className="p-4 bg-red-50 rounded">
                <p className="text-muted-foreground text-sm">Rejected</p>
                <p className="text-2xl font-bold">{grns.filter((g: any) => g.status === "rejected").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
