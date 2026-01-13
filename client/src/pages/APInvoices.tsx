import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Trash2, CheckCircle, AlertCircle, Search } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardTable } from "@/components/ui/StandardTable";
import { VendorPicker } from "@/components/finance/VendorPicker";
import { PurchaseOrderPicker } from "@/components/procurement/PurchaseOrderPicker";

export default function APInvoices() {
  const { toast } = useToast();
  const [newInvoice, setNewInvoice] = useState({
    invoiceNumber: "",
    supplierId: "",
    invoiceAmount: "",
    status: "DRAFT",
    poHeaderId: ""
  });

  const { data: invoices = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/ap/invoices"],
    queryFn: () => fetch("/api/ap/invoices").then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/ap/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        header: {
          invoiceNumber: data.invoiceNumber,
          supplierId: parseInt(data.supplierId),
          invoiceAmount: data.invoiceAmount,
          invoiceDate: new Date().toISOString(),
          invoiceStatus: data.status
        },
        lines: data.poHeaderId ? [{
          lineNumber: 1,
          amount: data.invoiceAmount,
          poHeaderId: data.poHeaderId,
          lineType: "ITEM"
        }] : []
      })
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ap/invoices"] });
      setNewInvoice({ invoiceNumber: "", supplierId: "", invoiceAmount: "", status: "DRAFT", poHeaderId: "" });
      toast({ title: "Invoice created" });
    },
  });

  const validateMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/ap/invoices/${id}/validate`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ap/invoices"] });
      toast({ title: "Invoice validated" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/ap/invoices/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ap/invoices"] });
      toast({ title: "Invoice deleted" });
    },
  });

  const total = invoices.reduce((sum, i: any) => sum + parseFloat(i.invoiceAmount || 0), 0);
  const validated = invoices.filter(i => i.validationStatus === "VALIDATED").reduce((sum, i: any) => sum + parseFloat(i.invoiceAmount || 0), 0);
  const pending = total - validated;

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DRAFT: "secondary",
    VALIDATED: "default",
    APPROVED: "default",
    PAID: "outline",
    REJECTED: "destructive",
  };

  const columns = [
    { header: "Invoice #", accessorKey: "invoiceNumber", className: "font-mono font-medium" },
    {
      header: "Supplier",
      accessorKey: "supplierId",
      cell: (row: any) => row.supplier?.name || `ID: ${row.supplierId}`
    },
    {
      header: "Amount",
      accessorKey: "invoiceAmount",
      cell: (row: any) => <span className="font-semibold">${parseFloat(row.invoiceAmount).toFixed(2)}</span>
    },
    {
      header: "Validation",
      accessorKey: "validationStatus",
      cell: (row: any) => (
        <Badge variant={row.validationStatus === "VALIDATED" ? "default" : "secondary"}>
          {row.validationStatus}
        </Badge>
      )
    },
    {
      header: "Status",
      accessorKey: "invoiceStatus",
      cell: (row: any) => <Badge variant={statusColors[row.invoiceStatus] || "default"}>{row.invoiceStatus}</Badge>
    },
    {
      header: "Actions",
      id: "actions",
      cell: (row: any) => (
        <div className="flex gap-2">
          {row.validationStatus !== "VALIDATED" && (
            <Button size="sm" variant="outline" onClick={() => validateMutation.mutate(row.id)}>
              Validate
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(row.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            Accounts Payable
          </h1>
          <p className="text-muted-foreground">Manage vendor invoices, matching, and payment processing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><AlertCircle className="w-4 h-4 mr-2" /> View Holds</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total Payables</p>
            <p className="text-3xl font-bold">${total.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border-green-200">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Validated</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-green-600">${validated.toLocaleString()}</p>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50/50 border-orange-200">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Action Required</p>
            <p className="text-3xl font-bold text-orange-600">${pending.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Invoice
            </CardTitle>
            <CardDescription>Enter invoice details or match to PO</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium px-1">Supplier</label>
              <VendorPicker
                value={newInvoice.supplierId}
                onChange={(v) => setNewInvoice({ ...newInvoice, supplierId: v })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium px-1">Invoice Number</label>
              <Input
                placeholder="e.g. INV-2024-001"
                value={newInvoice.invoiceNumber}
                onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium px-1">Amount</label>
              <Input
                type="number"
                placeholder="0.00"
                value={newInvoice.invoiceAmount}
                onChange={(e) => setNewInvoice({ ...newInvoice, invoiceAmount: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium px-1">Purchase Order (Optional)</label>
              <PurchaseOrderPicker
                value={newInvoice.poHeaderId}
                supplierId={newInvoice.supplierId}
                onChange={(v) => setNewInvoice({ ...newInvoice, poHeaderId: v })}
              />
            </div>
            <Button
              onClick={() => createMutation.mutate(newInvoice)}
              disabled={createMutation.isPending || !newInvoice.invoiceNumber || !newInvoice.supplierId}
              className="w-full"
            >
              {createMutation.isPending ? "Creating..." : "Create Invoice"}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Invoice Workbench</CardTitle>
              <CardDescription>Search and manage all payables</CardDescription>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Search invoices..." className="w-64 h-8 text-xs" />
              <Button size="sm" variant="outline" className="h-8"><Search className="w-3 h-3" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <StandardTable
              data={invoices}
              columns={columns}
              isLoading={isLoading}
              height={450}
              isVirtualized={true}
              keyExtractor={(row) => row.id}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
