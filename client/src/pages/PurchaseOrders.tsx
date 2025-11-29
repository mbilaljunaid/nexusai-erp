import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart, FileText } from "lucide-react";
import { IconNavigation } from "@/components/IconNavigation";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";

export default function PurchaseOrders() {
  const [activeNav, setActiveNav] = useState("list");
  const { data: pos = [] } = useQuery<any[]>({ queryKey: ["/api/procurement/purchase-orders"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/procurement/purchase-orders", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] }),
  });

  const navigationItems = [
    { id: "list", label: "POs", icon: ShoppingCart, badge: pos.length },
    { id: "create", label: "Create PO", icon: Plus },
    { id: "approvals", label: "For Approval", icon: FileText, badge: pos.filter((p: any) => p.status === "draft").length },
    { id: "analytics", label: "Analytics", icon: FileText },
  ];

  const statusColors: Record<string, string> = {
    draft: "default",
    approved: "secondary",
    sent: "info",
    received: "success",
    closed: "outline",
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Purchase Orders</h1>
        <p className="text-muted-foreground">Create, track, and manage purchase orders with vendors</p>
      </div>

      <IconNavigation items={navigationItems} activeId={activeNav} onNavigate={setActiveNav} />

      {activeNav === "list" && (
        <div className="grid gap-4">
          {pos.map((po: any) => (
            <Card key={po.id} className="hover-elevate">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{po.poNumber}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Vendor: {po.vendorId}</p>
                  </div>
                  <Badge variant={statusColors[po.status] || "default"}>{po.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-semibold text-lg">${po.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Delivery Date</p>
                    <p className="font-semibold">{po.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Terms</p>
                    <p className="font-semibold">{po.paymentTerms || "Not set"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeNav === "create" && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Purchase Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Vendor ID" />
            <Input placeholder="Total Amount" type="number" />
            <Input placeholder="Delivery Date" type="date" />
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Create PO
            </Button>
          </CardContent>
        </Card>
      )}

      {activeNav === "approvals" && (
        <div className="space-y-4">
          <p className="text-lg font-semibold">{pos.filter((p: any) => p.status === "draft").length} POs awaiting approval</p>
          {pos
            .filter((p: any) => p.status === "draft")
            .map((po: any) => (
              <Card key={po.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{po.poNumber}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">${po.totalAmount}</span>
                    <div className="space-x-2">
                      <Button size="sm" variant="default" onClick={() => createMutation.mutate({ ...po, status: "approved" })}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline">
                        Reject
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
            <CardTitle>PO Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded">
                <p className="text-muted-foreground text-sm">Total POs</p>
                <p className="text-2xl font-bold">{pos.length}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded">
                <p className="text-muted-foreground text-sm">Draft</p>
                <p className="text-2xl font-bold">{pos.filter((p: any) => p.status === "draft").length}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded">
                <p className="text-muted-foreground text-sm">Approved</p>
                <p className="text-2xl font-bold">{pos.filter((p: any) => p.status === "approved").length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded">
                <p className="text-muted-foreground text-sm">Received</p>
                <p className="text-2xl font-bold">{pos.filter((p: any) => p.status === "received").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
