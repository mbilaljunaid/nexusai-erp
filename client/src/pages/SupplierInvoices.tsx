import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, AlertCircle } from "lucide-react";
import { IconNavigation } from "@/components/IconNavigation";

export default function SupplierInvoices() {
  const [activeNav, setActiveNav] = useState("list");
  const { data: invoices = [] } = useQuery<any[]>({ queryKey: ["/api/procurement/supplier-invoices"] });

  const navigationItems = [
    { id: "list", label: "Invoices", icon: FileText, badge: invoices.length, color: "blue" as const },
    { id: "create", label: "Create Invoice", icon: Plus, color: "green" as const },
    { id: "exceptions", label: "Exceptions", icon: AlertCircle, badge: invoices.filter((i: any) => i.status === "exception").length, color: "red" as const },
    { id: "paid", label: "Paid", icon: FileText, badge: invoices.filter((i: any) => i.status === "paid").length, color: "purple" as const },
  ];

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    received: "secondary",
    validated: "default",
    matched_po_grn: "default",
    exception: "destructive",
    approved: "secondary",
    paid: "outline",
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Supplier Invoices (AP)</h1>
        <p className="text-muted-foreground">Manage vendor invoices, match with POs/GRNs, and process payments</p>
      </div>

      <IconNavigation items={navigationItems} activeId={activeNav} onNavigate={setActiveNav} />

      {activeNav === "list" && (
        <div className="grid gap-4">
          {invoices.map((inv: any) => (
            <Card key={inv.id} className="hover-elevate">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{inv.invoiceNumber}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Vendor: {inv.vendorId}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <Badge variant={statusColors[inv.status] || "default"}>{inv.status}</Badge>
                    {inv.matchingStatus && <p className="text-xs text-muted-foreground">{inv.matchingStatus}</p>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-semibold text-lg">${inv.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Invoice Date</p>
                    <p className="font-semibold">{inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-semibold">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">PO</p>
                    <p className="font-semibold">{inv.poId || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeNav === "exceptions" && (
        <div className="space-y-4">
          <p className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            {invoices.filter((i: any) => i.status === "exception").length} Exceptions Requiring Action
          </p>
          {invoices
            .filter((i: any) => i.status === "exception")
            .map((inv: any) => (
              <Card key={inv.id} className="border-destructive">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{inv.invoiceNumber}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-3">
                    {inv.matchExceptions && Object.entries(inv.matchExceptions).map(([key, value]: [string, any]) => (
                      <p key={key} className="text-sm text-destructive">
                        {key}: {JSON.stringify(value)}
                      </p>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Review
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1">
                      Hold
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {activeNav === "paid" && (
        <Card>
          <CardHeader>
            <CardTitle>Paid Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">{invoices.filter((i: any) => i.status === "paid").length} invoices paid</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
