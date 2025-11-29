import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function InvoiceEntryForm() {
  const [lines, setLines] = useState([{ id: 1, desc: "", qty: "", rate: "" }]);
  const [showAI, setShowAI] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vendor, setVendor] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  
  const total = lines.reduce((sum, line) => sum + ((parseFloat(line.qty) || 0) * (parseFloat(line.rate) || 0)), 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-semibold">Vendor Invoice Entry</h2>
        <p className="text-sm text-muted-foreground">Create and process vendor invoices with automatic GL mapping</p>
      </div>

      <Tabs defaultValue="entry" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entry">Invoice Details</TabsTrigger>
          <TabsTrigger value="lines">Line Items</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Invoice Header</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Vendor *</Label>
                  <Select value={vendor} onValueChange={setVendor}><SelectTrigger className="text-sm"><SelectValue placeholder="Select vendor" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acme">Acme Supplies</SelectItem>
                      <SelectItem value="tech">Tech Services Inc</SelectItem>
                    </SelectContent></Select>
                </div>
                <div className="space-y-2">
                  <Label>Invoice Number *</Label>
                  <Input placeholder="INV-2024-001" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label>Invoice Date *</Label>
                  <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Invoice details..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-16 text-sm" />
              </div>
            </CardContent>
          </Card>

          {showAI && (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-900 dark:text-blue-100 ml-2">
                <strong>AI Suggestions:</strong> Vendor matched • GL accounts auto-mapped • Tax calculated
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="lines" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Line Items</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b"><th className="text-left p-2">Description</th><th className="text-right p-2">Qty</th><th className="text-right p-2">Rate</th><th className="text-right p-2">Amount</th><th className="p-2">GL Account</th><th></th></tr>
                  </thead>
                  <tbody>
                    {lines.map((line, idx) => (
                      <tr key={line.id} className="border-b hover:bg-muted">
                        <td className="p-2"><Input type="text" placeholder="Item" value={line.desc} onChange={(e) => { const newLines = [...lines]; newLines[idx].desc = e.target.value; setLines(newLines); }} className="text-xs h-8" /></td>
                        <td className="p-2 text-right"><Input type="number" placeholder="0" value={line.qty} onChange={(e) => { const newLines = [...lines]; newLines[idx].qty = e.target.value; setLines(newLines); }} className="text-xs h-8 text-right" /></td>
                        <td className="p-2 text-right"><Input type="number" placeholder="0.00" value={line.rate} onChange={(e) => { const newLines = [...lines]; newLines[idx].rate = e.target.value; setLines(newLines); }} className="text-xs h-8 text-right font-mono" /></td>
                        <td className="p-2 text-right font-mono text-xs">${((parseFloat(line.qty) || 0) * (parseFloat(line.rate) || 0)).toFixed(2)}</td>
                        <td className="p-2"><Select><SelectTrigger className="text-xs h-8"><SelectValue placeholder="5000" /></SelectTrigger><SelectContent><SelectItem value="5100">5100 - Supplies</SelectItem></SelectContent></Select></td>
                        <td className="p-2"><Button variant="ghost" size="sm" onClick={() => setLines(lines.filter((_, i) => i !== idx))}><Trash2 className="h-3 w-3" /></Button></td>
                      </tr>
                    ))}
                    <tr className="font-semibold border-t-2 bg-muted"><td colSpan={4} className="p-2">Total:</td><td colSpan={2} className="p-2 text-right font-mono">${total.toFixed(2)}</td></tr>
                  </tbody>
                </table>
              </div>
              <Button variant="outline" size="sm" onClick={() => setLines([...lines, { id: Math.max(...lines.map(l => l.id)) + 1, desc: "", qty: "", rate: "" }])}><Plus className="h-4 w-4 mr-2" />Add Line</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setShowAI(!showAI)} className="gap-1"><Sparkles className="h-4 w-4" />AI Assist</Button>
        <Button 
          onClick={async () => {
            if (!vendor || !invoiceNumber || !invoiceDate) {
              toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
              return;
            }
            setIsLoading(true);
            try {
              await api.erp.invoices.create({ vendor, invoiceNumber, invoiceDate, description, lines, total });
              toast({ title: "Success", description: "Invoice posted successfully" });
              setVendor(""); setInvoiceNumber(""); setInvoiceDate(""); setDescription("");
              setLines([{ id: 1, desc: "", qty: "", rate: "" }]);
            } catch (e) {
              toast({ title: "Error", description: "Failed to post invoice", variant: "destructive" });
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Post Invoice
        </Button>
        <Button variant="outline">Save Draft</Button>
      </div>
    </div>
  );
}
