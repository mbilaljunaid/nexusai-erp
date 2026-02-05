import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus } from "lucide-react";

export default function PurchaseRequisitions() {
  const requisitions = [
    { id: "pr1", number: "PR-2025-001", department: "Operations", items: 5, amount: "$25,000", status: "approved", date: "Nov 30, 2025" },
    { id: "pr2", number: "PR-2025-002", department: "Manufacturing", items: 12, amount: "$45,000", status: "pending", date: "Nov 29, 2025" },
    { id: "pr3", number: "PR-2025-003", department: "Logistics", items: 8, amount: "$18,500", status: "approved", date: "Nov 28, 2025" },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Purchase Requisitions
        </h1>
        <p className="text-muted-foreground mt-2">Manage purchase requests and approvals</p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <Button className="w-full gap-2" data-testid="button-create-pr">
            <Plus className="h-4 w-4" />
            Create Requisition
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total PRs</p>
            <p className="text-2xl font-bold">{requisitions.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-600">{requisitions.filter(r => r.status === "approved").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold">$88.5K</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Requisitions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {requisitions.map((req) => (
            <div key={req.id} className="p-3 border rounded-lg hover-elevate" data-testid={`pr-${req.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{req.number}</h3>
                <Badge variant={req.status === "approved" ? "default" : "secondary"}>{req.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Department: {req.department} • Items: {req.items} • Amount: {req.amount} • Date: {req.date}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
