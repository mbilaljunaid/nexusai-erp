import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText } from "lucide-react";
import { IconNavigation } from "@/components/IconNavigation";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function RFQs() {
  const [activeNav, setActiveNav] = useState("list");
  const [newRfq, setNewRfq] = useState({ rfqNumber: "", title: "", description: "", vendorId: "" });

  const { data: rfqs = [] } = useQuery<any[]>({ queryKey: ["/api/procurement/rfqs"] });
  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/procurement/rfqs", data)
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/procurement/rfqs"] });
      setNewRfq({ rfqNumber: "", title: "", description: "", vendorId: "" });
    }
  });

  const navigationItems = [
    { id: "list", label: "RFQ List", icon: FileText, badge: rfqs.length, color: "blue" as const }
    { id: "create", label: "Create RFQ", icon: Plus, color: "green" as const }
    { id: "analytics", label: "Analytics", icon: FileText, color: "purple" as const }
    { id: "templates", label: "Templates", icon: FileText, color: "orange" as const }
  ];

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = { 
    draft: "default"
    sent: "secondary"
    quoted: "destructive"
    closed: "outline" 
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Request for Quotation (RFQ)</h1>
        <p className="text-muted-foreground">Manage RFQs, send quotes to vendors, and track responses</p>
      </div>

      <IconNavigation items={navigationItems} activeId={activeNav} onNavigate={setActiveNav} />

      {activeNav === "list" && (
        <div className="grid gap-4">
          {rfqs.map((rfq: any) => (
            <Card key={rfq.id} className="hover-elevate cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{rfq.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{rfq.rfqNumber}</p>
                  </div>
                  <Badge variant={statusColors[rfq.status] || "default"}>{rfq.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Vendor</p>
                    <p className="font-semibold">{rfq.vendorId || "Not assigned"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-semibold">{rfq.dueDate ? new Date(rfq.dueDate).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Description</p>
                    <p className="text-sm">{rfq.description}</p>
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
            <CardTitle>Create New RFQ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">RFQ Number</label>
              <Input value={newRfq.rfqNumber} onChange={(e) => setNewRfq({ ...newRfq, rfqNumber: e.target.value })} placeholder="RFQ-2024-001" />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Title</label>
              <Input value={newRfq.title} onChange={(e) => setNewRfq({ ...newRfq, title: e.target.value })} placeholder="Office Equipment" />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Description</label>
              <textarea className="w-full border rounded p-2 text-sm" rows={4} value={newRfq.description} onChange={(e) => setNewRfq({ ...newRfq, description: e.target.value })} placeholder="Detailed requirements..." />
            </div>
            <Button onClick={() => createMutation.mutate(newRfq)} disabled={!newRfq.rfqNumber || !newRfq.title} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Create RFQ
            </Button>
          </CardContent>
        </Card>
      )}

      {activeNav === "analytics" && (
        <Card>
          <CardHeader>
            <CardTitle>RFQ Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded">
                <p className="text-muted-foreground text-sm">Total RFQs</p>
                <p className="text-2xl font-bold">{rfqs.length}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded">
                <p className="text-muted-foreground text-sm">Pending Response</p>
                <p className="text-2xl font-bold">{rfqs.filter((r: any) => r.status === "sent").length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded">
                <p className="text-muted-foreground text-sm">Quoted</p>
                <p className="text-2xl font-bold">{rfqs.filter((r: any) => r.status === "quoted").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeNav === "templates" && (
        <Card>
          <CardHeader>
            <CardTitle>RFQ Templates</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Save RFQ templates for faster creation</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
