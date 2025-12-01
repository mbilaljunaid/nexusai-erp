import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, FileCheck } from "lucide-react";
import { IconNavigation } from "@/components/IconNavigation";
import { Button } from "@/components/ui/button";

export default function ThreeWayMatch() {
  const [activeNav, setActiveNav] = useState("all");
  const { data: matches = [] } = useQuery<any[]>({ queryKey: ["/api/procurement/three-way-matches"] });

  const navigationItems = [
    { id: "all", label: "All Matches", icon: FileCheck, badge: matches.length, color: "blue" as const }
    { id: "matched", label: "Matched", icon: CheckCircle, badge: matches.filter((m: any) => m.matchStatus === "matched").length, color: "green" as const }
    { id: "exceptions", label: "Exceptions", icon: AlertTriangle, badge: matches.filter((m: any) => m.matchStatus !== "matched").length, color: "red" as const }
    { id: "pending", label: "Pending Approval", icon: FileCheck, badge: matches.filter((m: any) => m.approvalRequired).length, color: "orange" as const }
  ];

  const matchStatusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    matched: "default"
    variance_qty: "secondary"
    variance_price: "secondary"
    variance_both: "destructive"
    exception: "destructive"
  };

  const filteredMatches = {
    all: matches
    matched: matches.filter((m: any) => m.matchStatus === "matched")
    exceptions: matches.filter((m: any) => m.matchStatus !== "matched")
    pending: matches.filter((m: any) => m.approvalRequired)
  }[activeNav] || [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Three-Way Match</h1>
        <p className="text-muted-foreground">Match Purchase Orders, Goods Receipts, and Supplier Invoices</p>
      </div>

      <IconNavigation items={navigationItems} activeId={activeNav} onNavigate={setActiveNav} />

      <div className="grid gap-4">
        {filteredMatches.map((match: any) => (
          <Card key={match.id} className={match.matchStatus !== "matched" ? "border-destructive" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Match ID: {match.id.slice(0, 8)}</CardTitle>
                  <div className="text-sm text-muted-foreground mt-1 space-y-1">
                    <p>PO: {match.poId.slice(0, 8)} | GRN: {match.grnId.slice(0, 8)} | Invoice: {match.invoiceId.slice(0, 8)}</p>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <Badge variant={matchStatusColors[match.matchStatus] || "default"}>{match.matchStatus}</Badge>
                  {match.approvalRequired && <Badge variant="outline">Needs Approval</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                <div className="p-3 bg-slate-50 rounded">
                  <p className="text-muted-foreground text-xs font-semibold mb-1">QUANTITY</p>
                  {match.quantityVariance ? (
                    <div>
                      <p className="text-destructive font-bold">Variance: {match.quantityVariance}</p>
                      <p className="text-xs text-muted-foreground mt-1">Exceeds tolerance: {match.toleranceExceeded ? "Yes" : "No"}</p>
                    </div>
                  ) : (
                    <p className="text-green-600 font-semibold">Matched ✓</p>
                  )}
                </div>
                <div className="p-3 bg-slate-50 rounded">
                  <p className="text-muted-foreground text-xs font-semibold mb-1">PRICE</p>
                  {match.priceVariance ? (
                    <div>
                      <p className="text-destructive font-bold">${match.priceVariance}</p>
                      <p className="text-xs text-muted-foreground mt-1">{match.priceVariancePercent}%</p>
                    </div>
                  ) : (
                    <p className="text-green-600 font-semibold">Matched ✓</p>
                  )}
                </div>
                <div className="p-3 bg-slate-50 rounded">
                  <p className="text-muted-foreground text-xs font-semibold mb-1">STATUS</p>
                  <p className="font-semibold capitalize">{match.matchStatus.replace("_", " ")}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded">
                  <p className="text-muted-foreground text-xs font-semibold mb-1">MATCHED AT</p>
                  <p className="font-semibold">{match.matchedAt ? new Date(match.matchedAt).toLocaleDateString() : "Pending"}</p>
                </div>
              </div>

              {match.exceptionReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded mb-4">
                  <p className="text-xs font-semibold text-red-900 mb-1">Exception Reason</p>
                  <p className="text-sm text-red-800">{match.exceptionReason}</p>
                </div>
              )}

              {match.approvalRequired && (
                <div className="flex gap-2">
                  <Button size="sm" variant="default" className="flex-1">
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Request Correction
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1">
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            <FileCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No matches found for this view</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
