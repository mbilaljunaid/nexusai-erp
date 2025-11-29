import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Trash2 } from "lucide-react";

interface POLine {
  id: number;
  item: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  total: number;
}

export function PurchaseOrderForm() {
  const [poNumber, setPoNumber] = useState("");
  const [vendor, setVendor] = useState("");
  const [poDate, setPoDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [lines, setLines] = useState<POLine[]>([
    { id: 1, item: "", description: "", quantity: "", unit: "EA", unitPrice: "", total: 0 }
  ]);

  const addLine = () => {
    setLines(prev => [...prev, {
      id: Math.max(...prev.map(l => l.id), 0) + 1,
      item: "",
      description: "",
      quantity: "",
      unit: "EA",
      unitPrice: "",
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
      const price = parseFloat(updated.unitPrice) || 0;
      updated.total = qty * price;
      return updated;
    }));
  };

  const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" />
          Purchase Order
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Create and manage purchase orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">PO Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="po">PO Number *</Label>
              <Input
                id="po"
                placeholder="Auto-generated"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor *</Label>
              <Select value={vendor} onValueChange={setVendor}>
                <SelectTrigger id="vendor">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendor1">Global Supplies Inc</SelectItem>
                  <SelectItem value="vendor2">Tech Parts Ltd</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="podate">PO Date *</Label>
              <Input id="podate" type="date" value={poDate} onChange={(e) => setPoDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duedate">Due Date *</Label>
              <Input id="duedate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm">Line Items</h3>
              <Button size="sm" onClick={addLine} className="gap-1">
                <Plus className="w-4 h-4" /> Add Line
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Item</th>
                    <th className="text-left py-2 px-2">Description</th>
                    <th className="text-right py-2 px-2">Qty</th>
                    <th className="text-left py-2 px-2">Unit</th>
                    <th className="text-right py-2 px-2">Unit Price</th>
                    <th className="text-right py-2 px-2">Total</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map(line => (
                    <tr key={line.id} className="border-b">
                      <td className="py-2 px-2"><Input placeholder="Item" value={line.item} onChange={(e) => updateLine(line.id, "item", e.target.value)} className="text-xs" /></td>
                      <td className="py-2 px-2"><Input placeholder="Desc" value={line.description} onChange={(e) => updateLine(line.id, "description", e.target.value)} className="text-xs" /></td>
                      <td className="py-2 px-2"><Input type="number" placeholder="0" value={line.quantity} onChange={(e) => updateLine(line.id, "quantity", e.target.value)} className="text-xs text-right" /></td>
                      <td className="py-2 px-2">
                        <Select value={line.unit} onValueChange={(v) => updateLine(line.id, "unit", v)}>
                          <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="EA">EA</SelectItem><SelectItem value="BOX">BOX</SelectItem></SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-2"><Input type="number" placeholder="0" value={line.unitPrice} onChange={(e) => updateLine(line.id, "unitPrice", e.target.value)} className="text-xs text-right" /></td>
                      <td className="py-2 px-2 text-right">${line.total.toFixed(2)}</td>
                      <td className="py-2 px-2"><Button variant="ghost" size="sm" onClick={() => removeLine(line.id)}><Trash2 className="w-4 h-4" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-md space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Save & Send</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
