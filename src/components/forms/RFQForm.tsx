import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface RFQLine {
  id: number;
  item: string;
  description: string;
  quantity: string;
  specification: string;
}

interface RFQVendor {
  id: number;
  name: string;
  email: string;
}

export function RFQForm() {
  const { toast } = useToast();
  const [rfqNumber, setRfqNumber] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [scope, setScope] = useState("");
  const [lines, setLines] = useState<RFQLine[]>([
    { id: 1, item: "", description: "", quantity: "", specification: "" }
  ]);
  const [vendors, setVendors] = useState<RFQVendor[]>([
    { id: 1, name: "", email: "" }
  ]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/procurement/rfqs", {
        rfqNumber: rfqNumber,
        createdDate: createdDate,
        dueDate: dueDate,
        scope: scope,
        items: lines.map(l => ({
          itemName: l.item,
          description: l.description,
          quantity: parseFloat(l.quantity) || 0,
          specification: l.specification
        })),
        vendors: vendors.filter(v => v.name && v.email).map(v => ({
          vendorName: v.name,
          vendorEmail: v.email
        })),
        status: "SENT"
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "RFQ created and sent to vendors" });
      setRfqNumber("");
      setCreatedDate("");
      setDueDate("");
      setScope("");
      setLines([{ id: 1, item: "", description: "", quantity: "", specification: "" }]);
      setVendors([{ id: 1, name: "", email: "" }]);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create RFQ", variant: "destructive" });
    }
  });

  const addLine = () => {
    setLines(prev => [...prev, {
      id: Math.max(...prev.map(l => l.id), 0) + 1,
      item: "",
      description: "",
      quantity: "",
      specification: ""
    }]);
  };

  const removeLine = (id: number) => {
    setLines(prev => prev.filter(l => l.id !== id));
  };

  const updateLine = (id: number, field: string, value: string) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const addVendor = () => {
    setVendors(prev => [...prev, {
      id: Math.max(...prev.map(v => v.id), 0) + 1,
      name: "",
      email: ""
    }]);
  };

  const removeVendor = (id: number) => {
    setVendors(prev => prev.filter(v => v.id !== id));
  };

  const updateVendor = (id: number, field: string, value: string) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Mail className="w-6 h-6" />
          Request for Quotation (RFQ)
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Request quotes from vendors for goods or services</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">RFQ Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rfq-number">RFQ Number</Label>
              <Input id="rfq-number" placeholder="RFQ-2025-001" value={rfqNumber} onChange={(e) => setRfqNumber(e.target.value)} data-testid="input-rfq-number" />
            </div>
            <div>
              <Label htmlFor="created-date">Created Date</Label>
              <Input id="created-date" type="date" value={createdDate} onChange={(e) => setCreatedDate(e.target.value)} data-testid="input-created-date" />
            </div>
            <div>
              <Label htmlFor="due-date">Quote Due Date</Label>
              <Input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} data-testid="input-due-date" />
            </div>
          </div>
          <div>
            <Label htmlFor="scope">Scope of Request</Label>
            <Textarea id="scope" placeholder="Describe what you are requesting quotes for" value={scope} onChange={(e) => setScope(e.target.value)} data-testid="input-scope" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-1">
          <CardTitle className="text-base">Items for Quote</CardTitle>
          <Button size="sm" variant="outline" onClick={addLine} data-testid="button-add-item">
            <Plus className="w-4 h-4 mr-1" /> Add Item
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
              <div className="flex-1">
                <Label className="text-xs">Specification</Label>
                <Input placeholder="Specs/Details" value={line.specification} onChange={(e) => updateLine(line.id, "specification", e.target.value)} data-testid={`input-spec-${line.id}`} />
              </div>
              <Button size="icon" variant="ghost" onClick={() => removeLine(line.id)} data-testid={`button-delete-item-${line.id}`}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-1">
          <CardTitle className="text-base">Send to Vendors</CardTitle>
          <Button size="sm" variant="outline" onClick={addVendor} data-testid="button-add-vendor">
            <Plus className="w-4 h-4 mr-1" /> Add Vendor
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="flex gap-2 items-end border rounded p-3">
              <div className="flex-1">
                <Label className="text-xs">Vendor Name</Label>
                <Input placeholder="Vendor company name" value={vendor.name} onChange={(e) => updateVendor(vendor.id, "name", e.target.value)} data-testid={`input-vendor-name-${vendor.id}`} />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Email</Label>
                <Input type="email" placeholder="vendor@example.com" value={vendor.email} onChange={(e) => updateVendor(vendor.id, "email", e.target.value)} data-testid={`input-vendor-email-${vendor.id}`} />
              </div>
              <Button size="icon" variant="ghost" onClick={() => removeVendor(vendor.id)} data-testid={`button-delete-vendor-${vendor.id}`}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="text-xs text-muted-foreground">
            {vendors.filter(v => v.name && v.email).length} vendor(s) will receive this RFQ
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending} className="w-full" data-testid="button-send-rfq">
        {submitMutation.isPending ? "Sending..." : "Send RFQ to Vendors"}
      </Button>
    </div>
  );
}
