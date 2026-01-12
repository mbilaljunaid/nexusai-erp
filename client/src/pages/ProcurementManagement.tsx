import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ShoppingCart, Truck, PackageCheck, FileText, CheckCircle, XCircle, ArrowRightLeft, DollarSign, Calendar } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ProcurementManagement() {
  const { toast } = useToast();
  const [viewType, setViewType] = useState("pos"); // pos, suppliers, receiving, requisitions, invoices
  const [newPO, setNewPO] = useState({ poNumber: "", supplierId: "", status: "Draft", lines: [] as any[] });
  const [newLine, setNewLine] = useState({ description: "", quantity: "1", unitPrice: "0" });
  const [newSupplier, setNewSupplier] = useState({ supplierName: "", supplierNumber: "" });
  const [receivingPO, setReceivingPO] = useState<any>(null);
  const [receiptQuantities, setReceiptQuantities] = useState<Record<string, string>>({});

  // Requisition State
  const [reqView, setReqView] = useState("my-reqs");
  const [cart, setCart] = useState<any[]>([]);
  const [reqDescription, setReqDescription] = useState("Monthly Supplies");

  // AP State
  const [newInvoice, setNewInvoice] = useState({ invoiceNumber: "", supplierId: "", purchaseOrderId: "", amount: "", invoiceDate: "" });
  const [paymentAmount, setPaymentAmount] = useState("");

  const { data: pos = [], isLoading: posLoading } = useQuery({ queryKey: ["/api/procurement/purchase-orders"], queryFn: () => fetch("/api/procurement/purchase-orders").then(r => r.json()).catch(() => []) });
  const { data: suppliers = [], isLoading: supLoading } = useQuery<any[]>({ queryKey: ["/api/procurement/suppliers"], queryFn: () => fetch("/api/procurement/suppliers").then(r => r.json()).catch(() => []) });
  const { data: receipts = [] } = useQuery<any[]>({ queryKey: ["/api/procurement/receipts"], queryFn: () => fetch("/api/procurement/receipts").then(r => r.json()).catch(() => []) });
  const { data: requisitions = [] } = useQuery<any[]>({ queryKey: ["/api/procurement/requisitions"], queryFn: () => fetch("/api/procurement/requisitions").then(r => r.json()).catch(() => []) });
  const { data: items = [] } = useQuery<any[]>({ queryKey: ["/api/inventory/items"], queryFn: () => fetch("/api/inventory/items").then(r => r.json()).catch(() => []) });
  const { data: invoices = [], isLoading: invLoading } = useQuery<any[]>({ queryKey: ["/api/procurement/ap/invoices"], queryFn: () => fetch("/api/procurement/ap/invoices").then(r => r.json()).catch(() => []) });

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

  const validateInvoiceMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/procurement/ap/invoices/${id}/validate`, { method: "POST" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/ap/invoices"] }); toast({ title: "Invoice Validated" }); }
  });

  const payInvoiceMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string, amount: string }) => fetch(`/api/procurement/ap/invoices/${id}/pay`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount, paymentMethod: "Wire" }) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/ap/invoices"] }); setPaymentAmount(""); toast({ title: "Payment Recorded" }); }
  });

  // Requisition Actions
  const reqAction = (id: string, action: string) => { fetch(`/api/procurement/requisitions/${id}/${action}`, { method: 'POST' }).then(() => { queryClient.invalidateQueries({ queryKey: ["/api/procurement/requisitions"] }); if (action === 'convert-to-po') queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] }); toast({ title: `Requisition ${action} successful` }); }); };
  const addLine = () => { if (!newLine.description) return; setNewPO({ ...newPO, lines: [...newPO.lines, newLine] }); setNewLine({ description: "", quantity: "1", unitPrice: "0" }); };
  const removeLine = (index: number) => { const updatedLines = [...newPO.lines]; updatedLines.splice(index, 1); setNewPO({ ...newPO, lines: updatedLines }); };
  const calculateTotal = () => newPO.lines.reduce((sum, line) => sum + (parseFloat(line.quantity) * parseFloat(line.unitPrice)), 0).toFixed(2);
  const submitReceipt = () => { if (!receivingPO) return; const linesToReceive = receivingPO.lines.map((line: any) => ({ poLineId: line.id, quantity: receiptQuantities[line.id] || "0", itemId: line.itemId })).filter((l: any) => parseFloat(l.quantity) > 0); if (linesToReceive.length === 0) { toast({ title: "No quantities entered", variant: "destructive" }); return; } createReceiptMutation.mutate({ purchaseOrderId: receivingPO.id, lines: linesToReceive }); };
  const addToCart = (item: any) => { setCart([...cart, { itemId: item.id, description: item.description, quantity: 1, unitPrice: 10, categoryName: item.categoryName }]); toast({ title: "Added to cart" }); };
  const submitRequisition = () => { if (cart.length === 0) return; createRequisitionMutation.mutate({ description: reqDescription, lines: cart, requesterId: "USER-1" }); };

  return (
    <div className="space-y-6 p-4" data-testid="procurement-management">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><ShoppingCart className="h-8 w-8" />Procurement & Supply Chain</h1>
        <p className="text-muted-foreground mt-1">Manage Suppliers, POs, Receipts, Requisitions, and Invoices</p>
      </div>

      <div className="flex gap-2 mb-4">
        <Button variant={viewType === "pos" ? "default" : "outline"} onClick={() => setViewType("pos")}><ShoppingCart className="w-4 h-4 mr-2" /> Purchase Orders</Button>
        <Button variant={viewType === "receiving" ? "default" : "outline"} onClick={() => setViewType("receiving")}><Truck className="w-4 h-4 mr-2" /> Receiving</Button>
        <Button variant={viewType === "requisitions" ? "default" : "outline"} onClick={() => setViewType("requisitions")}><FileText className="w-4 h-4 mr-2" /> Requisitions</Button>
        <Button variant={viewType === "invoices" ? "default" : "outline"} onClick={() => setViewType("invoices")}><DollarSign className="w-4 h-4 mr-2" /> Invoices (AP)</Button>
        <Button variant={viewType === "suppliers" ? "default" : "outline"} onClick={() => setViewType("suppliers")}>Suppliers</Button>
      </div>

      {viewType === "invoices" && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Create Invoice</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <Input placeholder="Invoice Number" value={newInvoice.invoiceNumber} onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })} />
                <Select value={newInvoice.supplierId} onValueChange={(v) => setNewInvoice({ ...newInvoice, supplierId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                  <SelectContent>{suppliers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.supplierName}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={newInvoice.purchaseOrderId} onValueChange={(v) => setNewInvoice({ ...newInvoice, purchaseOrderId: v })}>
                  <SelectTrigger><SelectValue placeholder="Match PO (Optional)" /></SelectTrigger>
                  <SelectContent>{pos.filter((p: any) => p.supplierId === newInvoice.supplierId || p.supplier?.id === newInvoice.supplierId).map((p: any) => <SelectItem key={p.id} value={p.id}>{p.poNumber}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" placeholder="Amount" value={newInvoice.amount} onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })} />
              </div>
              <Button className="w-full" disabled={createInvoiceMutation.isPending || !newInvoice.invoiceNumber || !newInvoice.supplierId || !newInvoice.amount} onClick={() => createInvoiceMutation.mutate(newInvoice)}>Create Invoice</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Invoices Workbench</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {invoices.length === 0 ? <p className="text-muted-foreground">No invoices found.</p> : invoices.map((inv: any) => (
                <div key={inv.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2"><p className="font-semibold">{inv.invoiceNumber}</p><Badge variant={inv.status === 'Paid' ? 'default' : inv.status === 'Validated' ? 'secondary' : 'outline'}>{inv.status}</Badge></div>
                    <p className="text-sm text-muted-foreground">{inv.supplier.supplierName} • ${inv.amount} • {new Date(inv.invoiceDate).toLocaleDateString()}</p>
                    {inv.purchaseOrder && <p className="text-xs text-muted-foreground">Matched to {inv.purchaseOrder.poNumber}</p>}
                  </div>
                  <div className="flex gap-2 items-center">
                    {inv.status === 'Draft' && <Button size="sm" variant="outline" onClick={() => validateInvoiceMutation.mutate(inv.id)}>Validate</Button>}
                    {(inv.status === 'Validated' || inv.status === 'Partially Paid') && (
                      <div className="flex items-center gap-2">
                        <Input className="w-24 h-8" placeholder="Amount" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />
                        <Button size="sm" onClick={() => payInvoiceMutation.mutate({ id: inv.id, amount: paymentAmount || inv.amount })}>Pay</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {viewType === "requisitions" && (
        <div className="space-y-4">
          <div className="flex gap-2"><Button size="sm" variant={reqView === "my-reqs" ? "default" : "secondary"} onClick={() => setReqView("my-reqs")}>My Requisitions</Button><Button size="sm" variant={reqView === "shop" ? "default" : "secondary"} onClick={() => setReqView("shop")}>Shop Catalog</Button></div>
          {reqView === "shop" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 grid grid-cols-2 gap-3">{items.length === 0 ? <p className="text-muted-foreground col-span-2">No items in catalog.</p> : items.map((item: any) => (<Card key={item.id} className="cursor-pointer hover:border-primary" onClick={() => addToCart(item)}><CardContent className="p-4"><h4 className="font-semibold">{item.itemNumber}</h4><p className="text-sm text-muted-foreground">{item.description}</p><Badge variant="secondary" className="mt-2">{item.categoryName || "General"}</Badge></CardContent></Card>))}</div>
              <Card className="h-fit"><CardHeader><CardTitle className="text-base">Requisition Cart ({cart.length})</CardTitle></CardHeader><CardContent className="space-y-3"><Input placeholder="Requisition Title" value={reqDescription} onChange={e => setReqDescription(e.target.value)} />{cart.map((line, idx) => (<div key={idx} className="flex justify-between text-sm border-b pb-1"><span>{line.description} (x{line.quantity})</span><Button size="icon" variant="ghost" className="h-4 w-4" onClick={() => { const c = [...cart]; c.splice(idx, 1); setCart(c); }}><Trash2 className="w-3 h-3" /></Button></div>))}<Button className="w-full" disabled={cart.length === 0} onClick={submitRequisition}>Submit Requisition</Button></CardContent></Card>
            </div>
          )}
          {reqView === "my-reqs" && (<Card><CardHeader><CardTitle>All Requisitions</CardTitle></CardHeader><CardContent className="space-y-3">{requisitions.length === 0 ? <p className="text-muted-foreground">No requisitions found.</p> : requisitions.map((req: any) => (<div key={req.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between"><div><div className="flex items-center gap-2"><p className="font-semibold">{req.reqNumber}</p><Badge variant={req.status === 'Approved' ? 'default' : req.status === 'Rejected' ? 'destructive' : 'outline'}>{req.status}</Badge></div><p className="text-sm text-muted-foreground">{req.description} • ${req.totalAmount}</p></div><div className="flex gap-2">{req.status === 'Draft' && <Button size="sm" variant="outline" onClick={() => reqAction(req.id, 'submit')}>Submit</Button>}{req.status === 'Pending Approval' && (<><Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => reqAction(req.id, 'approve')}><CheckCircle className="w-4 h-4 mr-1" /> Approve</Button><Button size="sm" variant="destructive" onClick={() => reqAction(req.id, 'reject')}><XCircle className="w-4 h-4 mr-1" /> Reject</Button></>)}{req.status === 'Approved' && <Button size="sm" variant="secondary" onClick={() => reqAction(req.id, 'convert-to-po')}><ArrowRightLeft className="w-4 h-4 mr-1" /> Convert to PO</Button>}</div></div>))}</CardContent></Card>)}
        </div>
      )}

      {viewType === "pos" && (
        <div className="space-y-4">
          <Card data-testid="card-new-po"><CardHeader><CardTitle className="text-base">Create Purchase Order</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid grid-cols-3 gap-3"><Input placeholder="PO Number" value={newPO.poNumber} onChange={(e) => setNewPO({ ...newPO, poNumber: e.target.value })} data-testid="input-po-number" /><Select value={newPO.supplierId} onValueChange={(v) => setNewPO({ ...newPO, supplierId: v })}><SelectTrigger><SelectValue placeholder="Select Supplier" /></SelectTrigger><SelectContent>{suppliers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.supplierName}</SelectItem>)}</SelectContent></Select><div className="flex items-center text-sm font-bold text-muted-foreground border px-3 rounded-md bg-muted/50">Total: ${calculateTotal()}</div></div><div className="border rounded-md p-3 bg-muted/20"><h4 className="text-sm font-semibold mb-2">Line Items</h4><div className="grid grid-cols-4 gap-2 mb-2"><Input placeholder="Description" value={newLine.description} onChange={(e) => setNewLine({ ...newLine, description: e.target.value })} className="col-span-2" /><Input placeholder="Qty" type="number" value={newLine.quantity} onChange={(e) => setNewLine({ ...newLine, quantity: e.target.value })} /><Input placeholder="Price" type="number" value={newLine.unitPrice} onChange={(e) => setNewLine({ ...newLine, unitPrice: e.target.value })} /></div><Button size="sm" variant="secondary" onClick={addLine} disabled={!newLine.description} className="w-full mb-2"><Plus className="w-3 h-3 mr-2" /> Add Line</Button>{newPO.lines.map((line, idx) => (<div key={idx} className="flex justify-between items-center text-sm p-2 border-b last:border-0"><span>{line.description} ({line.quantity} x ${line.unitPrice})</span><Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeLine(idx)}><Trash2 className="w-3 h-3" /></Button></div>))}</div><Button disabled={createPOMutation.isPending || !newPO.poNumber || !newPO.supplierId || newPO.lines.length === 0} className="w-full" onClick={() => createPOMutation.mutate(newPO)} data-testid="button-create-po"><Plus className="w-4 h-4 mr-2" /> Create PO (Draft)</Button></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Purchase Orders</CardTitle></CardHeader><CardContent className="space-y-3">{posLoading ? <p>Loading...</p> : pos.length === 0 ? <p className="text-muted-foreground">No POs created</p> : pos.map((po: any) => (<div key={po.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between" data-testid={`po-${po.id}`}><div><div className="flex items-center gap-2"><p className="font-semibold">{po.poNumber}</p><Badge variant={po.status === 'Draft' ? 'outline' : 'default'}>{po.status}</Badge></div><p className="text-sm text-muted-foreground">{suppliers.find(s => s.id === (po.supplier?.id || po.supplierId))?.supplierName || "Unknown Supplier"} • ${po.totalAmount || po.amount} • {po.lines?.length || 0} Lines</p></div><div className="flex gap-2 items-center">{po.status === 'Draft' && <Button size="sm" variant="outline" onClick={() => fetch(`/api/procurement/purchase-orders/${po.id}/approve`, { method: 'POST' }).then(() => queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] }))}>Approve</Button>}{po.status === 'Approved' && <Button size="sm" variant="default" onClick={() => fetch(`/api/procurement/purchase-orders/${po.id}/open`, { method: 'POST' }).then(() => queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] }))}>Open</Button>}<Button size="icon" variant="ghost" onClick={() => deletePOMutation.mutate(po.id)} data-testid={`button-delete-${po.id}`}><Trash2 className="w-4 h-4" /></Button></div></div>))}</CardContent></Card>
        </div>
      )}

      {viewType === "receiving" && (
        <div className="space-y-4">
          {!receivingPO ? (
            <Card><CardHeader><CardTitle className="text-base">Ready for Receipt</CardTitle></CardHeader><CardContent>{pos.filter((p: any) => p.status === 'Open').length === 0 ? <p className="text-muted-foreground">No Open POs to receive.</p> : pos.filter((p: any) => p.status === 'Open').map((po: any) => (<div key={po.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between mb-2"><div><p className="font-semibold">{po.poNumber}</p><p className="text-sm text-muted-foreground">{suppliers.find(s => s.id === po.supplierId)?.supplierName} • {po.lines.length} Lines</p></div><Button size="sm" onClick={() => setReceivingPO(po)}>Receive</Button></div>))}</CardContent></Card>
          ) : (
            <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">Receiving against {receivingPO.poNumber}</CardTitle><Button variant="ghost" size="sm" onClick={() => setReceivingPO(null)}>Cancel</Button></CardHeader><CardContent className="space-y-4">{receivingPO.lines.map((line: any) => { const remaining = parseFloat(line.quantity) - parseFloat(line.quantityReceived || 0); return (<div key={line.id} className="grid grid-cols-4 gap-4 items-center border-b pb-2"><div className="col-span-2"><p className="font-medium">{line.itemDescription}</p><p className="text-xs text-muted-foreground">Ordered: {line.quantity} | Received: {line.quantityReceived || 0}</p></div><Input type="number" placeholder={`Max ${remaining}`} value={receiptQuantities[line.id] || ""} onChange={(e) => setReceiptQuantities({ ...receiptQuantities, [line.id]: e.target.value })} /><div className="text-sm text-right text-muted-foreground">Remaining: {remaining}</div></div>); })}<Button className="w-full" onClick={submitReceipt} disabled={createReceiptMutation.isPending}><PackageCheck className="w-4 h-4 mr-2" /> Confirm Receipt</Button></CardContent></Card>
          )}
          <Card><CardHeader><CardTitle className="text-base">Recent Receipts</CardTitle></CardHeader><CardContent>{receipts.length === 0 ? <p className="text-muted-foreground">No receipts found</p> : receipts.map((r: any) => (<div key={r.id} className="p-3 border rounded-lg mb-2"><div className="flex justify-between"><p className="font-semibold">{r.receiptNumber}</p><span className="text-xs text-muted-foreground">{new Date(r.receiptDate).toLocaleDateString()}</span></div><p className="text-sm text-muted-foreground">PO: {r.purchaseOrder?.poNumber}</p></div>))}</CardContent></Card>
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
