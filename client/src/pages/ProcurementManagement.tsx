import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ShoppingCart, Truck, PackageCheck, FileText, CheckCircle, XCircle, ArrowRightLeft, DollarSign, Calendar, Undo2, Gavel, BarChart3, BrainCircuit, Lightbulb } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ProcurementManagement() {
  const { toast } = useToast();
  const [viewType, setViewType] = useState("dashboard"); // dashboard, pos, suppliers, receiving, requisitions, invoices, sourcing, analytics, ai
  const [newPO, setNewPO] = useState({ poNumber: "", supplierId: "", status: "Draft", lines: [] as any[] });
  const [newLine, setNewLine] = useState({ description: "", quantity: "1", unitPrice: "0" });
  const [newSupplier, setNewSupplier] = useState({ supplierName: "", supplierNumber: "" });
  const [receivingPO, setReceivingPO] = useState<any>(null);
  const [receiptQuantities, setReceiptQuantities] = useState<Record<string, string>>({});
  const [returnReceiptLine, setReturnReceiptLine] = useState<any>(null);
  const [returnQty, setReturnQty] = useState("");

  // Requisition State
  const [reqView, setReqView] = useState("my-reqs");
  const [cart, setCart] = useState<any[]>([]);
  const [reqDescription, setReqDescription] = useState("Monthly Supplies");

  // AP State
  const [newInvoice, setNewInvoice] = useState({ invoiceNumber: "", supplierId: "", purchaseOrderId: "", amount: "", invoiceDate: "" });
  const [paymentAmount, setPaymentAmount] = useState("");

  // Sourcing State
  const [newRFQ, setNewRFQ] = useState({ title: "", lines: [] as any[] });
  const [newRFQLine, setNewRFQLine] = useState({ description: "", targetQuantity: "" });
  const [selectedRFQ, setSelectedRFQ] = useState<any>(null);
  const [newQuote, setNewQuote] = useState({ supplierId: "", quoteAmount: "" });

  const { data: pos = [], isLoading: posLoading } = useQuery({ queryKey: ["/api/procurement/purchase-orders"], queryFn: () => fetch("/api/procurement/purchase-orders").then(r => r.json()).catch(() => []) });
  const { data: suppliers = [], isLoading: supLoading } = useQuery<any[]>({ queryKey: ["/api/procurement/suppliers"], queryFn: () => fetch("/api/procurement/suppliers").then(r => r.json()).catch(() => []) });
  const { data: receipts = [] } = useQuery<any[]>({ queryKey: ["/api/procurement/receipts"], queryFn: () => fetch("/api/procurement/receipts").then(r => r.json()).catch(() => []) });
  const { data: requisitions = [] } = useQuery<any[]>({ queryKey: ["/api/procurement/requisitions"], queryFn: () => fetch("/api/procurement/requisitions").then(r => r.json()).catch(() => []) });
  const { data: items = [] } = useQuery<any[]>({ queryKey: ["/api/inventory/items"], queryFn: () => fetch("/api/inventory/items").then(r => r.json()).catch(() => []) });
  const { data: invoices = [] } = useQuery<any[]>({ queryKey: ["/api/procurement/ap/invoices"], queryFn: () => fetch("/api/procurement/ap/invoices").then(r => r.json()).catch(() => []) });
  const { data: rfqs = [] } = useQuery<any[]>({ queryKey: ["/api/procurement/sourcing/rfqs"], queryFn: () => fetch("/api/procurement/sourcing/rfqs").then(r => r.json()).catch(() => []) });
  const { data: aiInsights = [] } = useQuery<any[]>({ queryKey: ["/api/procurement/ai/insights"], queryFn: () => fetch("/api/procurement/ai/insights").then(r => r.json()).catch(() => []) });

  const createPOMutation = useMutation({
    mutationFn: (data: any) => {
      const totalAmount = data.lines.reduce((sum: number, line: any) => sum + (parseFloat(line.quantity) * parseFloat(line.unitPrice)), 0);
      const payload = { ...data, totalAmount, lines: data.lines.map((line: any, index: number) => ({ lineNumber: index + 1, itemDescription: line.description, categoryName: "General", quantity: parseFloat(line.quantity), unitPrice: parseFloat(line.unitPrice), lineAmount: parseFloat(line.quantity) * parseFloat(line.unitPrice) })) };
      return fetch("/api/procurement/purchase-orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(r => r.json());
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] }); setNewPO({ poNumber: "", supplierId: "", status: "Draft", lines: [] }); setNewLine({ description: "", quantity: "1", unitPrice: "0" }); toast({ title: "PO created" }); },
  });

  const deletePOMutation = useMutation({ mutationFn: (id: string) => fetch(`/api/procurement/purchase-orders/${id}`, { method: "DELETE" }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] }); toast({ title: "PO deleted" }); } });
  const createSupplierMutation = useMutation({ mutationFn: (data: any) => fetch("/api/procurement/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/suppliers"] }); setNewSupplier({ supplierName: "", supplierNumber: "" }); toast({ title: "Supplier created" }); } });
  const deleteSupplierMutation = useMutation({ mutationFn: (id: string) => fetch(`/api/procurement/suppliers/${id}`, { method: "DELETE" }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/suppliers"] }); toast({ title: "Supplier deleted" }); } });
  const createReceiptMutation = useMutation({ mutationFn: (data: any) => fetch("/api/procurement/receipts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/receipts"] }); queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] }); setReceivingPO(null); setReceiptQuantities({}); toast({ title: "Receipt created" }); } });
  const createRequisitionMutation = useMutation({ mutationFn: (data: any) => fetch("/api/procurement/requisitions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/requisitions"] }); setCart([]); setReqView("my-reqs"); toast({ title: "Requisition created" }); } });

  const createInvoiceMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/procurement/ap/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/ap/invoices"] }); setNewInvoice({ invoiceNumber: "", supplierId: "", purchaseOrderId: "", amount: "", invoiceDate: "" }); toast({ title: "Invoice created" }); }
  });
  const validateInvoiceMutation = useMutation({ mutationFn: (id: string) => fetch(`/api/procurement/ap/invoices/${id}/validate`, { method: "POST" }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/ap/invoices"] }); toast({ title: "Invoice Validated" }); } });
  const payInvoiceMutation = useMutation({ mutationFn: ({ id, amount }: { id: string, amount: string }) => fetch(`/api/procurement/ap/invoices/${id}/pay`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount, paymentMethod: "Wire" }) }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/ap/invoices"] }); setPaymentAmount(""); toast({ title: "Payment Recorded" }); } });
  const returnItemsMutation = useMutation({ mutationFn: (data: any) => fetch("/api/procurement/receipts/return", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/receipts"] }); queryClient.invalidateQueries({ queryKey: ["/api/procurement/ap/invoices"] }); setReturnReceiptLine(null); setReturnQty(""); toast({ title: "Return Processed & Debit Memo Created" }); } });

  const createRFQMutation = useMutation({ mutationFn: (data: any) => fetch("/api/procurement/sourcing/rfqs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/sourcing/rfqs"] }); setNewRFQ({ title: "", lines: [] }); toast({ title: "RFQ created" }); } });
  const publishRFQMutation = useMutation({ mutationFn: (id: string) => fetch(`/api/procurement/sourcing/rfqs/${id}/publish`, { method: "POST" }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/sourcing/rfqs"] }); toast({ title: "RFQ Published" }); } });
  const submitQuoteMutation = useMutation({ mutationFn: (data: any) => fetch(`/api/procurement/sourcing/rfqs/${data.id}/quotes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data.payload) }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/sourcing/rfqs"] }); setNewQuote({ supplierId: "", quoteAmount: "" }); toast({ title: "Quote Submitted" }); } });
  const awardQuoteMutation = useMutation({ mutationFn: (id: string) => fetch(`/api/procurement/sourcing/quotes/${id}/award`, { method: "POST" }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/sourcing/rfqs"] }); queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] }); toast({ title: "Quote Awarded & PO Created" }); } });

  const reqAction = (id: string, action: string) => { fetch(`/api/procurement/requisitions/${id}/${action}`, { method: 'POST' }).then(() => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/requisitions"] }); if (action === 'convert-to-po') queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] }); toast({ title: `Requisition ${action} successful` }); }); };
  const addLine = () => { if (!newLine.description) return; setNewPO({ ...newPO, lines: [...newPO.lines, newLine] }); setNewLine({ description: "", quantity: "1", unitPrice: "0" }); };
  const removeLine = (index: number) => { const updatedLines = [...newPO.lines]; updatedLines.splice(index, 1); setNewPO({ ...newPO, lines: updatedLines }); };
  const calculateTotal = () => newPO.lines.reduce((sum, line) => sum + (parseFloat(line.quantity) * parseFloat(line.unitPrice)), 0).toFixed(2);
  const submitReceipt = () => { if (!receivingPO) return; const linesToReceive = receivingPO.lines.map((line: any) => ({ poLineId: line.id, quantity: receiptQuantities[line.id] || "0", itemId: line.itemId })).filter((l: any) => parseFloat(l.quantity) > 0); if (linesToReceive.length === 0) { toast({ title: "No quantities entered", variant: "destructive" }); return; } createReceiptMutation.mutate({ purchaseOrderId: receivingPO.id, lines: linesToReceive }); };
  const addToCart = (item: any) => { setCart([...cart, { itemId: item.id, description: item.description, quantity: 1, unitPrice: 10, categoryName: item.categoryName }]); toast({ title: "Added to cart" }); };
  const submitRequisition = () => { if (cart.length === 0) return; createRequisitionMutation.mutate({ description: reqDescription, lines: cart, requesterId: "USER-1" }); };
  const submitReturn = () => { if (!returnReceiptLine || !returnQty) return; returnItemsMutation.mutate({ receiptLineId: returnReceiptLine.id, quantityToReturn: parseFloat(returnQty) }); };

  const addRFQLine = () => { if (!newRFQLine.description) return; setNewRFQ({ ...newRFQ, lines: [...newRFQ.lines, newRFQLine] }); setNewRFQLine({ description: "", targetQuantity: "" }); };

  // Analytics Helpers
  const spendBySupplier = suppliers.map((s: any) => {
    const spend = pos.filter((p: any) => (p.supplierId === s.id || p.supplier?.id === s.id) && p.status !== 'Cancelled').reduce((sum: number, p: any) => sum + Number(p.totalAmount || p.amount), 0);
    return { name: s.supplierName, amount: spend };
  }).filter((s: any) => s.amount > 0);

  const poStatusData = [
    { name: 'Draft', value: pos.filter((p: any) => p.status === 'Draft').length, color: '#94a3b8' },
    { name: 'Open', value: pos.filter((p: any) => p.status === 'Open').length, color: '#3b82f6' },
    { name: 'Closed', value: pos.filter((p: any) => p.status === 'Closed').length, color: '#22c55e' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 p-4" data-testid="procurement-management">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><ShoppingCart className="h-8 w-8 text-primary" />Procurement & Supply Chain</h1>
        <p className="text-muted-foreground mt-1">Enterprise Source-to-Pay Management</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant={viewType === "dashboard" ? "default" : "outline"} onClick={() => setViewType("dashboard")}><BarChart3 className="w-4 h-4 mr-2" /> Dashboard</Button>
        <Button variant={viewType === "pos" ? "default" : "outline"} onClick={() => setViewType("pos")}><ShoppingCart className="w-4 h-4 mr-2" /> Orders</Button>
        <Button variant={viewType === "receiving" ? "default" : "outline"} onClick={() => setViewType("receiving")}><Truck className="w-4 h-4 mr-2" /> Receiving</Button>
        <Button variant={viewType === "requisitions" ? "default" : "outline"} onClick={() => setViewType("requisitions")}><FileText className="w-4 h-4 mr-2" /> Requisitions</Button>
        <Button variant={viewType === "invoices" ? "default" : "outline"} onClick={() => setViewType("invoices")}><DollarSign className="w-4 h-4 mr-2" /> Invoices</Button>
        <Button variant={viewType === "sourcing" ? "default" : "outline"} onClick={() => setViewType("sourcing")}><Gavel className="w-4 h-4 mr-2" /> Sourcing</Button>
        <Button variant={viewType === "ai" ? "default" : "outline"} onClick={() => setViewType("ai")}><BrainCircuit className="w-4 h-4 mr-2" /> AI Insights</Button>
        <Button variant={viewType === "suppliers" ? "default" : "outline"} onClick={() => setViewType("suppliers")}>Suppliers</Button>
      </div>

      {viewType === "dashboard" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover-elevate transform transition-all hover:scale-[1.01] cursor-pointer" onClick={() => setViewType('pos')}>
              <CardHeader className="p-4"><CardTitle className="text-sm font-medium text-muted-foreground">Open Orders</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{pos.filter((p: any) => p.status === 'Open').length}</div></CardContent>
            </Card>
            <Card className="hover-elevate transform transition-all hover:scale-[1.01] cursor-pointer" onClick={() => setViewType('receiving')}>
              <CardHeader className="p-4"><CardTitle className="text-sm font-medium text-muted-foreground">Pending Receipts</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{pos.filter((p: any) => p.status === 'Open' && p.lines.some((l: any) => Number(l.quantityReceived) < Number(l.quantity))).length}</div></CardContent>
            </Card>
            <Card className="hover-elevate transform transition-all hover:scale-[1.01] cursor-pointer" onClick={() => setViewType('invoices')}>
              <CardHeader className="p-4"><CardTitle className="text-sm font-medium text-muted-foreground">Draft Invoices</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{invoices.filter((i: any) => i.status === 'Draft').length}</div></CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Spend by Supplier</CardTitle></CardHeader>
              <CardContent className="h-[300px]">
                {spendBySupplier.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={spendBySupplier}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis prefix="$" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center text-muted-foreground">No spend data available</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>PO Status Breakdown</CardTitle></CardHeader>
              <CardContent className="h-[300px]">
                {poStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={poStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {poStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center text-muted-foreground">No PO data available</div>}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {viewType === "ai" && (
        <div className="space-y-4">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-900 border-blue-200 dark:border-blue-900">
            <CardHeader><CardTitle className="flex items-center gap-2"><BrainCircuit className="text-indigo-600" /> NexusAI Procurement Agent</CardTitle><CardDescription>Real-time insights and autonomous suggestions</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-start p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-blue-100 dark:border-slate-700">
                <Lightbulb className="text-yellow-500 w-6 h-6 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm">Supplier Risk Alert</h4>
                  <p className="text-sm text-muted-foreground mt-1">Supplier <strong>Acme Corp</strong> has a 15% return rate on recent deliveries. Consider sourcing "Office Chairs" from <strong>Global Supplies Inc</strong> instead used in RFQ-123.</p>
                  <Button size="sm" variant="outline" className="mt-2 text-xs">View Supplier Health</Button>
                </div>
              </div>
              <div className="flex gap-4 items-start p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-blue-100 dark:border-slate-700">
                <ShoppingCart className="text-blue-500 w-6 h-6 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm">Re-order Suggestion</h4>
                  <p className="text-sm text-muted-foreground mt-1">Inventory for <strong>Laptops (Item-101)</strong> is projected to run out in 14 days based on current consumption. Automated Requisition REQ-992 drafted.</p>
                  <Button size="sm" className="mt-2 text-xs">Review Draft Requisition</Button>
                </div>
              </div>
              <div className="flex gap-4 items-start p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-blue-100 dark:border-slate-700">
                <DollarSign className="text-green-500 w-6 h-6 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm">Early Payment Opportunity</h4>
                  <p className="text-sm text-muted-foreground mt-1">You have 3 invoices eligible for <strong>2% discount</strong> if paid by Friday. Potential savings: $450.00.</p>
                  <Button size="sm" variant="outline" className="mt-2 text-xs" onClick={() => setViewType('invoices')}>Go to Invoices</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {viewType === "sourcing" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card><CardHeader><CardTitle className="text-base">Create RFQ</CardTitle></CardHeader><CardContent className="space-y-3">
              <Input placeholder="RFQ Title" value={newRFQ.title} onChange={e => setNewRFQ({ ...newRFQ, title: e.target.value })} />
              <div className="border p-2 rounded bg-muted/20">
                <p className="text-xs font-semibold mb-2">Target Lines</p>
                <div className="flex gap-2 mb-2"><Input placeholder="Item Description" value={newRFQLine.description} onChange={e => setNewRFQLine({ ...newRFQLine, description: e.target.value })} /><Input placeholder="Qty" type="number" className="w-20" value={newRFQLine.targetQuantity} onChange={e => setNewRFQLine({ ...newRFQLine, targetQuantity: e.target.value })} /><Button size="sm" onClick={addRFQLine}><Plus className="w-4 h-4" /></Button></div>
                {newRFQ.lines.map((l, idx) => (<div key={idx} className="text-xs border-b pb-1 mb-1">{l.description} (x{l.targetQuantity})</div>))}
              </div>
              <Button className="w-full" onClick={() => createRFQMutation.mutate(newRFQ)} disabled={!newRFQ.title || newRFQ.lines.length === 0}>Create Draft RFQ</Button>
            </CardContent></Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Active RFQs</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {rfqs.map((rfq: any) => (
                  <div key={rfq.id} className="p-3 border rounded-lg hover-elevate">
                    <div className="flex justify-between items-center mb-2">
                      <div><p className="font-semibold">{rfq.rfqNumber}: {rfq.title}</p><Badge variant={rfq.status === 'Active' ? 'default' : rfq.status === 'Awarded' ? 'secondary' : 'outline'}>{rfq.status}</Badge></div>
                      {rfq.status === 'Draft' && <Button size="sm" onClick={() => publishRFQMutation.mutate(rfq.id)}>Publish</Button>}
                      {rfq.status === 'Active' && <Button size="sm" variant="outline" onClick={() => setSelectedRFQ(rfq)}>Manage Quotes</Button>}
                    </div>
                    <p className="text-xs text-muted-foreground">{rfq.quotes?.length} quotes received</p>

                    {selectedRFQ?.id === rfq.id && (
                      <div className="mt-3 border-t pt-2 bg-muted/10 p-2 rounded">
                        <p className="font-semibold text-xs mb-2">Submit Mock Quote</p>
                        <div className="flex gap-2 mb-3">
                          <Select value={newQuote.supplierId} onValueChange={v => setNewQuote({ ...newQuote, supplierId: v })}><SelectTrigger className="h-8"><SelectValue placeholder="Supplier" /></SelectTrigger><SelectContent>{suppliers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.supplierName}</SelectItem>)}</SelectContent></Select>
                          <Input type="number" placeholder="Total $" className="h-8 w-24" value={newQuote.quoteAmount} onChange={e => setNewQuote({ ...newQuote, quoteAmount: e.target.value })} />
                          <Button size="sm" onClick={() => submitQuoteMutation.mutate({ id: rfq.id, payload: newQuote })}>Submit</Button>
                        </div>
                        <p className="font-semibold text-xs mb-2">Received Quotes</p>
                        {rfq.quotes?.map((q: any) => (
                          <div key={q.id} className="flex justify-between items-center text-xs border-b pb-1 mb-1">
                            <span>{q.supplier?.supplierName}: ${q.quoteAmount}</span>
                            {q.status === 'Submitted' && <Button size="xs" className="h-6" onClick={() => awardQuoteMutation.mutate(q.id)}>Award</Button>}
                            {q.status === 'Awarded' && <Badge className="h-5 bg-green-600">Winner</Badge>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {viewType === "receiving" && (
        <div className="space-y-4">
          {!receivingPO ? (
            <Card><CardHeader><CardTitle className="text-base">Ready for Receipt</CardTitle></CardHeader><CardContent>{pos.filter((p: any) => p.status === 'Open').length === 0 ? <p className="text-muted-foreground">No Open POs to receive.</p> : pos.filter((p: any) => p.status === 'Open').map((po: any) => (<div key={po.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between mb-2"><div><p className="font-semibold">{po.poNumber}</p><p className="text-sm text-muted-foreground">{suppliers.find(s => s.id === po.supplierId)?.supplierName} • {po.lines.length} Lines</p></div><Button size="sm" onClick={() => setReceivingPO(po)}>Receive</Button></div>))}</CardContent></Card>
          ) : (
            <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">Receiving against {receivingPO.poNumber}</CardTitle><Button variant="ghost" size="sm" onClick={() => setReceivingPO(null)}>Cancel</Button></CardHeader><CardContent className="space-y-4">{receivingPO.lines.map((line: any) => { const remaining = parseFloat(line.quantity) - parseFloat(line.quantityReceived || 0); return (<div key={line.id} className="grid grid-cols-4 gap-4 items-center border-b pb-2"><div className="col-span-2"><p className="font-medium">{line.itemDescription}</p><p className="text-xs text-muted-foreground">Ordered: {line.quantity} | Received: {line.quantityReceived || 0}</p></div><Input type="number" placeholder={`Max ${remaining}`} value={receiptQuantities[line.id] || ""} onChange={(e) => setReceiptQuantities({ ...receiptQuantities, [line.id]: e.target.value })} /><div className="text-sm text-right text-muted-foreground">Remaining: {remaining}</div></div>); })}<Button className="w-full" onClick={submitReceipt} disabled={createReceiptMutation.isPending}><PackageCheck className="w-4 h-4 mr-2" /> Confirm Receipt</Button></CardContent></Card>
          )}
          {returnReceiptLine && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><Card className="w-full max-w-md"><CardHeader><CardTitle>Return Item</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm">Returning: <strong>{returnReceiptLine.poLine?.itemDescription || "Item"}</strong></p><p className="text-xs text-muted-foreground">Original Receipt: {returnReceiptLine.header.receiptNumber}</p><div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-semibold">Received</label><Input disabled value={returnReceiptLine.quantityReceived} /></div><div><label className="text-xs font-semibold">Already Returned</label><Input disabled value={returnReceiptLine.quantityReturned || 0} /></div></div><div><label className="text-xs font-semibold">Quantity to Return</label><Input type="number" value={returnQty} onChange={e => setReturnQty(e.target.value)} /></div><div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => { setReturnReceiptLine(null); setReturnQty(""); }}>Cancel</Button><Button variant="destructive" onClick={submitReturn} disabled={!returnQty || parseFloat(returnQty) <= 0}><Undo2 className="w-4 h-4 mr-2" /> Confirm Return</Button></div></CardContent></Card></div>)}
          <Card><CardHeader><CardTitle className="text-base">Recent Receipts & Returns</CardTitle></CardHeader><CardContent className="space-y-3">{receipts.length === 0 ? <p className="text-muted-foreground">No receipts found</p> : receipts.map((r: any) => (<div key={r.id} className="p-3 border rounded-lg mb-2"><div className="flex justify-between items-center"><div><p className="font-semibold">{r.receiptNumber}</p><span className="text-xs text-muted-foreground">{new Date(r.receiptDate).toLocaleDateString()} • PO: {r.purchaseOrder?.poNumber}</span></div></div><div className="mt-2 space-y-1">{r.lines?.map((line: any) => (<div key={line.id} className="flex justify-between items-center text-sm bg-muted/20 p-2 rounded"><span>{line.poLine?.itemDescription || "Item"} (Rx: {line.quantityReceived})</span><div className="flex items-center gap-2">{line.quantityReturned > 0 && <Badge variant="destructive" className="text-[10px] h-5">Returned: {line.quantityReturned}</Badge>}<Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => setReturnReceiptLine(line)}>Return</Button></div></div>))}</div></div>))}</CardContent></Card>
        </div>
      )}

      {viewType === "invoices" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle className="text-base">Create Invoice</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid grid-cols-4 gap-3"><Input placeholder="Invoice Number" value={newInvoice.invoiceNumber} onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })} /><Select value={newInvoice.supplierId} onValueChange={(v) => setNewInvoice({ ...newInvoice, supplierId: v })}><SelectTrigger><SelectValue placeholder="Select Supplier" /></SelectTrigger><SelectContent>{suppliers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.supplierName}</SelectItem>)}</SelectContent></Select><Select value={newInvoice.purchaseOrderId} onValueChange={(v) => setNewInvoice({ ...newInvoice, purchaseOrderId: v })}><SelectTrigger><SelectValue placeholder="Match PO (Optional)" /></SelectTrigger><SelectContent>{pos.filter((p: any) => p.supplierId === newInvoice.supplierId || p.supplier?.id === newInvoice.supplierId).map((p: any) => <SelectItem key={p.id} value={p.id}>{p.poNumber}</SelectItem>)}</SelectContent></Select><Input type="number" placeholder="Amount" value={newInvoice.amount} onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })} /></div><Button className="w-full" disabled={createInvoiceMutation.isPending || !newInvoice.invoiceNumber || !newInvoice.supplierId || !newInvoice.amount} onClick={() => createInvoiceMutation.mutate(newInvoice)}>Create Invoice</Button></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Invoices Workbench</CardTitle></CardHeader><CardContent className="space-y-3">{invoices.length === 0 ? <p className="text-muted-foreground">No invoices found.</p> : invoices.map((inv: any) => (<div key={inv.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between"><div><div className="flex items-center gap-2"><p className="font-semibold">{inv.invoiceNumber}</p><Badge variant={inv.status === 'Paid' ? 'default' : inv.status === 'Validated' ? 'secondary' : 'outline'}>{inv.status}</Badge>{Number(inv.amount) < 0 && <Badge variant="destructive" className="ml-2">Debit Memo</Badge>}</div><p className="text-sm text-muted-foreground">{inv.supplier.supplierName} • ${inv.amount} • {new Date(inv.invoiceDate).toLocaleDateString()}</p></div><div className="flex gap-2 items-center">{inv.status === 'Draft' && <Button size="sm" variant="outline" onClick={() => validateInvoiceMutation.mutate(inv.id)}>Validate</Button>}{(inv.status === 'Validated' || inv.status === 'Partially Paid') && Number(inv.amount) > 0 && (<div className="flex items-center gap-2"><Input className="w-24 h-8" placeholder="Amount" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} /><Button size="sm" onClick={() => payInvoiceMutation.mutate({ id: inv.id, amount: paymentAmount || inv.amount })}>Pay</Button></div>)}</div></div>))}</CardContent></Card>
        </div>
      )}

      {viewType === "requisitions" && (<div className="space-y-4"><div className="flex gap-2"><Button size="sm" variant={reqView === "my-reqs" ? "default" : "secondary"} onClick={() => setReqView("my-reqs")}>My Requisitions</Button><Button size="sm" variant={reqView === "shop" ? "default" : "secondary"} onClick={() => setReqView("shop")}>Shop Catalog</Button></div>{reqView === "shop" && (<div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="md:col-span-2 grid grid-cols-2 gap-3">{items.length === 0 ? <p className="text-muted-foreground col-span-2">No items in catalog.</p> : items.map((item: any) => (<Card key={item.id} className="cursor-pointer hover:border-primary" onClick={() => addToCart(item)}><CardContent className="p-4"><h4 className="font-semibold">{item.itemNumber}</h4><p className="text-sm text-muted-foreground">{item.description}</p><Badge variant="secondary" className="mt-2">{item.categoryName || "General"}</Badge></CardContent></Card>))}</div><Card className="h-fit"><CardHeader><CardTitle className="text-base">Requisition Cart ({cart.length})</CardTitle></CardHeader><CardContent className="space-y-3"><Input placeholder="Requisition Title" value={reqDescription} onChange={e => setReqDescription(e.target.value)} />{cart.map((line, idx) => (<div key={idx} className="flex justify-between text-sm border-b pb-1"><span>{line.description} (x{line.quantity})</span><Button size="icon" variant="ghost" className="h-4 w-4" onClick={() => { const c = [...cart]; c.splice(idx, 1); setCart(c); }}><Trash2 className="w-3 h-3" /></Button></div>))}<Button className="w-full" disabled={cart.length === 0} onClick={submitRequisition}>Submit Requisition</Button></CardContent></Card></div>)}{reqView === "my-reqs" && (<Card><CardHeader><CardTitle>All Requisitions</CardTitle></CardHeader><CardContent className="space-y-3">{requisitions.length === 0 ? <p className="text-muted-foreground">No requisitions found.</p> : requisitions.map((req: any) => (<div key={req.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between"><div><div className="flex items-center gap-2"><p className="font-semibold">{req.reqNumber}</p><Badge variant={req.status === 'Approved' ? 'default' : req.status === 'Rejected' ? 'destructive' : 'outline'}>{req.status}</Badge></div><p className="text-sm text-muted-foreground">{req.description} • ${req.totalAmount}</p></div><div className="flex gap-2">{req.status === 'Draft' && <Button size="sm" variant="outline" onClick={() => reqAction(req.id, 'submit')}>Submit</Button>}{req.status === 'Pending Approval' && (<><Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => reqAction(req.id, 'approve')}><CheckCircle className="w-4 h-4 mr-1" /> Approve</Button><Button size="sm" variant="destructive" onClick={() => reqAction(req.id, 'reject')}><XCircle className="w-4 h-4 mr-1" /> Reject</Button></>)}{req.status === 'Approved' && <Button size="sm" variant="secondary" onClick={() => reqAction(req.id, 'convert-to-po')}><ArrowRightLeft className="w-4 h-4 mr-1" /> Convert to PO</Button>}</div></div>))}</CardContent></Card>)}</div>)}
      {viewType === "pos" && (
        <div className="space-y-4">
          <Card data-testid="card-new-po"><CardHeader><CardTitle className="text-base">Create Purchase Order</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid grid-cols-3 gap-3"><Input placeholder="PO Number" value={newPO.poNumber} onChange={(e) => setNewPO({ ...newPO, poNumber: e.target.value })} data-testid="input-po-number" /><Select value={newPO.supplierId} onValueChange={(v) => setNewPO({ ...newPO, supplierId: v })}><SelectTrigger><SelectValue placeholder="Select Supplier" /></SelectTrigger><SelectContent>{suppliers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.supplierName}</SelectItem>)}</SelectContent></Select><div className="flex items-center text-sm font-bold text-muted-foreground border px-3 rounded-md bg-muted/50">Total: ${calculateTotal()}</div></div><div className="border rounded-md p-3 bg-muted/20"><h4 className="text-sm font-semibold mb-2">Line Items</h4><div className="grid grid-cols-4 gap-2 mb-2"><Input placeholder="Description" value={newLine.description} onChange={(e) => setNewLine({ ...newLine, description: e.target.value })} className="col-span-2" /><Input placeholder="Qty" type="number" value={newLine.quantity} onChange={(e) => setNewLine({ ...newLine, quantity: e.target.value })} /><Input placeholder="Price" type="number" value={newLine.unitPrice} onChange={(e) => setNewLine({ ...newLine, unitPrice: e.target.value })} /></div><Button size="sm" variant="secondary" onClick={addLine} disabled={!newLine.description} className="w-full mb-2"><Plus className="w-3 h-3 mr-2" /> Add Line</Button>{newPO.lines.map((line, idx) => (<div key={idx} className="flex justify-between items-center text-sm p-2 border-b last:border-0"><span>{line.description} ({line.quantity} x ${line.unitPrice})</span><Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeLine(idx)}><Trash2 className="w-3 h-3" /></Button></div>))}</div><Button disabled={createPOMutation.isPending || !newPO.poNumber || !newPO.supplierId || newPO.lines.length === 0} className="w-full" onClick={() => createPOMutation.mutate(newPO)} data-testid="button-create-po"><Plus className="w-4 h-4 mr-2" /> Create PO (Draft)</Button></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Purchase Orders</CardTitle></CardHeader><CardContent className="space-y-3">{posLoading ? <p>Loading...</p> : pos.length === 0 ? <p className="text-muted-foreground">No POs created</p> : pos.map((po: any) => (<div key={po.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between" data-testid={`po-${po.id}`}><div><div className="flex items-center gap-2"><p className="font-semibold">{po.poNumber}</p><Badge variant={po.status === 'Draft' ? 'outline' : 'default'}>{po.status}</Badge></div><p className="text-sm text-muted-foreground">{suppliers.find(s => s.id === (po.supplier?.id || po.supplierId))?.supplierName || "Unknown Supplier"} • ${po.totalAmount || po.amount} • {po.lines?.length || 0} Lines</p></div><div className="flex gap-2 items-center">{po.status === 'Draft' && <Button size="sm" variant="outline" onClick={() => fetch(`/api/procurement/purchase-orders/${po.id}/approve`, { method: 'POST' }).then(() => queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] }))}>Approve</Button>}{po.status === 'Approved' && <Button size="sm" variant="default" onClick={() => fetch(`/api/procurement/purchase-orders/${po.id}/open`, { method: 'POST' }).then(() => queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] }))}>Open</Button>}<Button size="icon" variant="ghost" onClick={() => deletePOMutation.mutate(po.id)} data-testid={`button-delete-${po.id}`}><Trash2 className="w-4 h-4" /></Button></div></div>))}</CardContent></Card>
        </div>
      )}

      {viewType === "suppliers" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle className="text-base">Add New Supplier</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid grid-cols-2 gap-3"><Input placeholder="Supplier Name" value={newSupplier.supplierName} onChange={(e) => setNewSupplier({ ...newSupplier, supplierName: e.target.value })} /><Input placeholder="Supplier Number" value={newSupplier.supplierNumber} onChange={(e) => setNewSupplier({ ...newSupplier, supplierNumber: e.target.value })} /></div><Button disabled={createSupplierMutation.isPending || !newSupplier.supplierName} className="w-full" onClick={() => createSupplierMutation.mutate(newSupplier)}><Plus className="w-4 h-4 mr-2" /> Create Supplier</Button></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Suppliers</CardTitle></CardHeader><CardContent className="space-y-3">{supLoading ? <p>Loading...</p> : suppliers.length === 0 ? <p className="text-muted-foreground">No suppliers</p> : suppliers.map((s: any) => (<div key={s.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between"><div><h4 className="font-semibold">{s.supplierName}</h4><p className="text-xs text-muted-foreground">#{s.supplierNumber}</p></div><Button size="icon" variant="ghost" onClick={() => deleteSupplierMutation.mutate(s.id)}><Trash2 className="w-4 h-4" /></Button></div>))}</CardContent></Card>
        </div>
      )}
    </div>
  );
}
