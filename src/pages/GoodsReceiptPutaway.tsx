import { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package2, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const receiptSchema = z.object({
  poId: z.string().min(1, "PO ID is required"),
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.coerce.number().min(1, "Quantity must be > 0"),
  status: z.string()
});

type ReceiptFormValues = z.infer<typeof receiptSchema>;

export default function GoodsReceiptPutaway() {
  const { toast } = useToast();

  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptSchema),
    defaultValues: { poId: "", productId: "", quantity: 100, status: "received" }
  });

  const { data: receipts = [], isLoading } = useQuery<any>({
    queryKey: ["/api/goods-receipt"],
    queryFn: () => fetch("/api/goods-receipt").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/goods-receipt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goods-receipt"] });
      form.reset({ poId: "", productId: "", quantity: 100, status: "received" });
      toast({ title: "Receipt created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/goods-receipt/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goods-receipt"] });
      toast({ title: "Receipt deleted" });
    },
  });

  const putaway = receipts.filter((r: any) => r.status === "putaway").length;
  const pending = receipts.filter((r: any) => r.status === "received").length;

  return (
    <StandardPage
      title="Goods Recei"
      description="Inbound receiving, quality check, and warehouse putaway operations"
    >

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Receipts</p>
            <p className="text-2xl font-bold">{receipts.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending QC</p>
            <p className="text-2xl font-bold text-yellow-600">{pending}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Putaway</p>
            <p className="text-2xl font-bold text-green-600">{putaway}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Units</p>
            <p className="text-2xl font-bold">{(receipts.reduce((sum: number, r: any) => sum + (parseFloat(r.quantity) || 0), 0) / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-receipt">
        <CardHeader><CardTitle className="text-base">Record Goods Receipt</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createMutation.mutate({ ...data, warehouseId: "WH-001" }))} className="grid grid-cols-5 gap-2">
              <FormField
                control={form.control}
                name="poId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="PO ID" data-testid="input-poid" className="text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Product ID" data-testid="input-prodid" className="text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Quantity" type="number" data-testid="input-qty" className="text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="received">Received</SelectItem>
                          <SelectItem value="qc-pending">QC Pending</SelectItem>
                          <SelectItem value="putaway">Putaway</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={createMutation.isPending} size="sm" data-testid="button-record">
                <Plus className="w-3 h-3" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Receipts</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <TableSkeleton rows={4} /> : receipts.length === 0 ? <p className="text-muted-foreground text-center py-4">No receipts</p> : receipts.map((r: any) => (
            <div key={r.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`receipt-${r.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{r.poId}</p>
                <p className="text-xs text-muted-foreground">{r.productId} • {r.quantity} units • {r.warehouseId}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={r.status === "putaway" ? "default" : "secondary"} className="text-xs">{r.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(r.id)} data-testid={`button-delete-${r.id}`} className="h-7 w-7" aria-label="Delete">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </StandardPage>
  );
}
