import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { useEffect } from "react";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
interface SalesOrder {
  id: string;
  orderId: string;
  customer: string;
  qty: string; // Keeping as string for now based on original, but should be number
  contractPrice: string;
  status: "pending" | "confirmed" | "shipped";
}

const salesOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  customer: z.string().min(1, "Customer is required"),
  qty: z.string().min(1, "Quantity is required"),
  contractPrice: z.string().min(1, "Contract Price is required")
});

export default function SalesOrderManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Partial<SalesOrder> | null>(null);

  const { data: orders = [], isLoading } = useQuery<SalesOrder[]>({
    queryKey: ["/api/sales-orders"],
    queryFn: async () => {
      const res = await fetch("/api/sales-orders");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<SalesOrder>) => {
      const res = await fetch("/api/sales-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales-orders"] });
      setIsSheetOpen(false);
      setEditingOrder(null);
      toast({ title: "Success", description: "Order saved successfully" });
    }
  });

  const form = useForm<z.infer<typeof salesOrderSchema>>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: {
      orderId: "",
      customer: "",
      qty: "",
      contractPrice: ""
    }
  });

  useEffect(() => {
    if (isSheetOpen) {
      if (editingOrder) {
        form.reset({
          orderId: editingOrder.orderId || "",
          customer: editingOrder.customer || "",
          qty: editingOrder.qty || "",
          contractPrice: editingOrder.contractPrice || ""
        });
      } else {
        form.reset({
          orderId: "",
          customer: "",
          qty: "",
          contractPrice: ""
        });
      }
    }
  }, [isSheetOpen, editingOrder, form]);

  const onSubmit = (values: z.infer<typeof salesOrderSchema>) => {
    mutation.mutate({
      ...values,
      status: editingOrder?.status || "pending"
    });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/sales-orders/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales-orders"] });
      toast({ title: "Order deleted" });
    },
  });

  const columns: SpreadsheetColumn<SalesOrder>[] = [
    { header: "Order ID", id: "orderId", width: "150px", cell: (row: SalesOrder) => <span className="font-mono font-bold">{row.orderId}</span> },
    { header: "Customer", id: "customer", width: "150px" },
    {
      header: "Amount", id: "contractPrice", width: "150px", cell: (row: SalesOrder) => {
        const amt = (parseFloat(row.qty) || 0) * (parseFloat(row.contractPrice) || 0);
        return <span className="font-mono">${amt.toFixed(2)}</span>;
      }
    },
    { header: "Status", id: "status", width: "150px", cell: (row: SalesOrder) => <Badge variant={row.status === "confirmed" ? "default" : "secondary"}>{row.status}</Badge> },
    {
      header: "Actions", id: "actions", cell: (row: SalesOrder) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setEditingOrder(row); setIsSheetOpen(true); }}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(row.id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )
    }
  ];



  const confirmed = orders.filter((o: any) => o.status === "confirmed").length;
  const totalValue = orders.reduce((sum: number, o: any) => sum + ((parseFloat(o.qty) || 0) * (parseFloat(o.contractPrice) || 0)), 0);


  return (
    <StandardPage
      title="Sales Order Management"
      description="Manage B2B sales quotations, contracts, and fulfillment"
      breadcrumbs={[{ label: "Sales", href: "/sales" }, { label: "Orders" }]}
      actions={
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={() => setEditingOrder(null)}>
              <Plus className="mr-2 h-4 w-4" /> New Order
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{editingOrder ? 'Edit' : 'Create'} Order</SheetTitle>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                <FormField
                  control={form.control}
                  name="orderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order ID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="qty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contractPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Price</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : "Save Order"}
                </Button>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      }
    >
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4"><CardContent className="pt-0"><p className="text-sm text-muted-foreground">Total Orders</p><p className="text-2xl font-bold">{orders.length}</p></CardContent></Card>
        <Card className="p-4"><CardContent className="pt-0"><p className="text-sm text-muted-foreground">Confirmed</p><p className="text-2xl font-bold text-green-600">{confirmed}</p></CardContent></Card>
        <Card className="p-4"><CardContent className="pt-0"><p className="text-sm text-muted-foreground">Total Value</p><p className="text-2xl font-bold">${(totalValue / 1000000).toFixed(2)}M</p></CardContent></Card>
        <Card className="p-4"><CardContent className="pt-0"><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold text-yellow-600">{orders.length - confirmed}</p></CardContent></Card>
      </div>

      <InteractiveSpreadsheet
        data={orders}
        columns={columns}
        isLoading={isLoading}
        onChange={() => { }} containerHeight="600px" />
    </StandardPage>
  );
}
