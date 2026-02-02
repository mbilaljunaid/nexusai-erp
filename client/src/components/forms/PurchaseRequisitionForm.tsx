import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface RequisitionLine {
  id: number;
  item: string;
  description: string;
  quantity: string;
  unit: string;
  estimatedCost: string;
  total: number;
}

export function PurchaseRequisitionForm() {
  const { toast } = useToast();
  const [reqNumber, setReqNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [requestDate, setRequestDate] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [justification, setJustification] = useState("");
  const [lines, setLines] = useState<RequisitionLine[]>([
    { id: 1, item: "", description: "", quantity: "", unit: "EA", estimatedCost: "", total: 0 }
  ]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
      return apiRequest("POST", "/api/procurement/requisitions", {
        requisitionNumber: reqNumber,
        department: department,
        requestDate: requestDate,
        requiredDate: requiredDate,
        justification: justification,
        items: lines.map(l => ({
          itemName: l.item,
          description: l.description,
          quantity: parseFloat(l.quantity) || 0,
          unit: l.unit,
          estimatedCost: parseFloat(l.estimatedCost) || 0
        })),
        subtotal: subtotal,
        status: "PENDING"
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Purchase requisition created successfully" });
      setReqNumber("");
      setDepartment("");
      setRequestDate("");
      setRequiredDate("");
      setJustification("");
      setLines([{ id: 1, item: "", description: "", quantity: "", unit: "EA", estimatedCost: "", total: 0 }]);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create requisition", variant: "destructive" });
    }
  });

  const addLine = () => {
    setLines(prev => [...prev, {
      id: Math.max(...prev.map(l => l.id), 0) + 1,
      item: "",
      description: "",
      quantity: "",
      unit: "EA",
      estimatedCost: "",
      total: 0
    }]);
  };

  const removeLine = (id: number) => {
    setLines(prev => prev.filter(l => l.id !== id));
  };

  const updateLine = (id: number, field: string, value: string) => {
    setLines(prev => prev.map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      const qty = parseFloat(updated.quantity) || 0;
      const cost = parseFloat(updated.estimatedCost) || 0;
      updated.total = qty * cost;
      return updated;
    }));
  };

  const subtotal = lines.reduce((sum, l) => sum + l.total, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Purchase Requisition
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Create a purchase requisition for goods or services</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Requisition Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="req-number">Requisition Number</Label>
              <Input id="req-number" placeholder="REQ-2025-001" value={reqNumber} onChange={(e) => setReqNumber(e.target.value)} data-testid="input-req-number" />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input id="department" placeholder="Engineering" value={department} onChange={(e) => setDepartment(e.target.value)} data-testid="input-department" />
            </div>
            <div>
              <Label htmlFor="request-date">Request Date</Label>
              <Input id="request-date" type="date" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} data-testid="input-request-date" />
            </div>
            <div>
              <Label htmlFor="required-date">Required Date</Label>
              <Input id="required-date" type="date" value={requiredDate} onChange={(e) => setRequiredDate(e.target.value)} data-testid="input-required-date" />
            </div>
          </div>
          <div>
            <Label htmlFor="justification">Justification</Label>
            <Textarea id="justification" placeholder="Business justification for this requisition" value={justification} onChange={(e) => setJustification(e.target.value)} data-testid="input-justification" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-1">
          <CardTitle className="text-base">Line Items</CardTitle>
          <Button size="sm" variant="outline" onClick={addLine} data-testid="button-add-line">
            <Plus className="w-4 h-4 mr-1" /> Add Line
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {lines.map((line) => (
            <div key={line.id} className="flex gap-2 items-end border rounded p-3">
              <div className="flex-1">
                <Label className="text-xs">Item</Label>
                <Input placeholder="Item name" value={line.item} onChange={(e) => updateLine(line.id, "item", e.target.value)} data-testid={`input-item-${line.id}`} />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Description</Label>
                <Input placeholder="Description" value={line.description} onChange={(e) => updateLine(line.id, "description", e.target.value)} data-testid={`input-desc-${line.id}`} />
              </div>
              <div className="w-24">
                <Label className="text-xs">Qty</Label>
                <Input type="number" placeholder="0" value={line.quantity} onChange={(e) => updateLine(line.id, "quantity", e.target.value)} data-testid={`input-qty-${line.id}`} />
              </div>
              <div className="w-20">
                <Label className="text-xs">Unit</Label>
                <Select value={line.unit} onValueChange={(val) => updateLine(line.id, "unit", val)}>
                  <SelectTrigger data-testid={`select-unit-${line.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EA">EA</SelectItem>
                    <SelectItem value="BOX">BOX</SelectItem>
                    <SelectItem value="KG">KG</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24">
                <Label className="text-xs">Est. Cost</Label>
                <Input type="number" placeholder="0" value={line.estimatedCost} onChange={(e) => updateLine(line.id, "estimatedCost", e.target.value)} data-testid={`input-cost-${line.id}`} />
              </div>
              <div className="w-24">
                <Label className="text-xs">Total</Label>
                <div className="h-9 flex items-center font-semibold">${line.total.toFixed(2)}</div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => removeLine(line.id)} data-testid={`button-delete-${line.id}`}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Estimated Total:</span>
            <Badge variant="default">${subtotal.toFixed(2)}</Badge>
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending} className="w-full" data-testid="button-submit-requisition">
        {submitMutation.isPending ? "Creating..." : "Create Requisition"}
      </Button>
    </div>
  );
}
