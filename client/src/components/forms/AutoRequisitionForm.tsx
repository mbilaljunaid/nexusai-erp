import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Zap, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LowStockItem {
  id: string;
  itemName: string;
  sku: string;
  quantity: number;
  reorderLevel: number;
  reorderQuantity: number;
}

export function AutoRequisitionForm({ item }: { item: LowStockItem }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [quantity, setQuantity] = useState(item.reorderQuantity.toString());

  const createRequisitionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/procurement/requisitions", {
        requisitionNumber: `AUTO - REQ - ${Date.now()} `,
        department: "Operations",
        requestDate: new Date().toISOString().split("T")[0],
        requiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        justification: `Automatic requisition for low stock item: ${item.itemName} `,
        items: [{
          itemName: item.itemName,
          description: `SKU: ${item.sku} `,
          quantity: parseInt(quantity),
          unit: "EA",
          estimatedCost: 0
        }],
        status: "AUTO_GENERATED",
        linkedInventoryItemId: item.id
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Auto - requisition created for ${item.itemName}`,
      });
      setShowForm(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create requisition",
        variant: "destructive",
      });
    }
  });

  if (!showForm) {
    return (
      <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-semibold">{item.itemName} - LOW STOCK</p>
                <p className="text-sm text-muted-foreground">Current: {item.quantity} (Reorder Level: {item.reorderLevel})</p>
              </div>
            </div>
            <Button size="sm" onClick={() => setShowForm(true)} data-testid="button-create-auto-req">
              <Wand2 className="w-4 h-4 mr-1" /> Create Auto-Requisition
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Create Auto-Requisition for {item.itemName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Item</Label>
            <Input value={item.itemName} disabled className="bg-muted" />
          </div>
          <div>
            <Label>SKU</Label>
            <Input value={item.sku} disabled className="bg-muted" />
          </div>
          <div>
            <Label>Current Stock</Label>
            <Input value={item.quantity} disabled className="bg-muted" />
          </div>
          <div>
            <Label>Reorder Quantity</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              data-testid="input-quantity"
            />
          </div>
        </div>

        <Card className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              This will automatically create a Purchase Requisition that will flow through RFQ → Purchase Order → Invoice workflow
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            onClick={() => createRequisitionMutation.mutate()}
            disabled={createRequisitionMutation.isPending}
            className="flex-1"
            data-testid="button-confirm-requisition"
          >
            {createRequisitionMutation.isPending ? "Creating..." : "Confirm Auto-Requisition"}
          </Button>
          <Button onClick={() => setShowForm(false)} variant="outline" data-testid="button-cancel">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
