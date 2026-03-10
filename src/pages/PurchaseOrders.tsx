import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { IconNavigation } from "@/components/IconNavigation";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DatePicker } from '@/components/ui/DatePicker';
import { useToast } from "@/hooks/use-toast";
import { StandardPage } from "@/components/layout/StandardPage";

const poSchema = z.object({
  vendorId: z.string().min(1, "Vendor ID is required"),
  totalAmount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
});

type POFormValues = z.infer<typeof poSchema>;

export default function PurchaseOrders() {
  const [activeNav, setActiveNav] = useState("list");
  const { toast } = useToast();
  const { data: pos = [] } = useQuery<any[]>({ queryKey: ["/api/procurement/purchase-orders"] });

  const form = useForm<POFormValues>({
    resolver: zodResolver(poSchema),
    defaultValues: {
      vendorId: "",
      totalAmount: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/procurement/purchase-orders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] });
      toast({ title: "Purchase Order created successfully" });
      form.reset();
      setActiveNav("list");
    },
    onError: (error: any) => {
      toast({ title: "Failed to create PO", description: error.message, variant: "destructive" });
    }
  });

  const onSubmit = (data: POFormValues) => {
    createMutation.mutate({
      ...data,
      poNumber: `PO-${Math.floor(Math.random() * 10000)}`,
      status: "draft",
      approvalStatus: "PENDING",
      totalAmount: data.totalAmount.toString(),
      deliveryDate: new Date(data.deliveryDate).toISOString(),
      vendorId: data.vendorId,
      departmentId: "DEPT-1" // Mock
    });
  };

  const navigationItems = [
    { id: "list", label: "POs", icon: ShoppingCart, badge: pos.length, color: "blue" as const },
    { id: "create", label: "Create PO", icon: Plus, color: "green" as const },
    { id: "approvals", label: "For Approval", icon: FileText, badge: pos.filter((p: any) => p.status === "draft").length, color: "orange" as const },
    { id: "analytics", label: "Analytics", icon: FileText, color: "purple" as const },
  ];

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "default",
    approved: "secondary",
    sent: "secondary",
    received: "default",
    closed: "outline",
  };

  return (
    <StandardPage
      title="Purchase Orders"
      description="Create, track, and manage purchase orders with vendors"
    >
      <IconNavigation items={navigationItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "list" && (
        <div className="grid gap-4">
          {pos.map((po: any) => (
            <Card key={po.id} className="hover-elevate">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{po.poNumber}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Vendor: {po.supplierName || po.vendorId || "Unknown"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {po.complianceStatus === 'NON_COMPLIANT' && (
                      <div className="flex items-center gap-1 text-destructive bg-destructive/10 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                        <Plus className="w-3 h-3 rotate-45" /> COMPLIANCE ALERT: {po.complianceReason}
                      </div>
                    )}
                    <Badge variant={statusColors[po.status] || "default"}>{po.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-semibold text-lg">${po.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Delivery Date</p>
                    <p className="font-semibold">{po.deliveryDate ? formatDate(po.deliveryDate) : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Terms</p>
                    <p className="font-semibold">{po.paymentTerms || "Not set"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeNav === "create" && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Purchase Order</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="vendorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Vendor ID (e.g., VEN-001)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Total Amount" type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Delivery Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={(date) => field.onChange(date)}
                          placeholder="Select Delivery Date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  <Plus className="w-4 h-4 mr-2" /> {createMutation.isPending ? "Creating..." : "Create PO"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {activeNav === "approvals" && (
        <div className="space-y-4">
          <p className="text-lg font-semibold">{pos.filter((p: any) => p.status === "draft").length} POs awaiting approval</p>
          {pos
            .filter((p: any) => p.status === "draft")
            .map((po: any) => (
              <Card key={po.id}>
                <CardHeader className="pb-3 px-6 pt-6">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{po.poNumber}</CardTitle>
                    {po.complianceStatus === 'NON_COMPLIANT' && (
                      <Badge variant="destructive" className="text-[10px] animate-pulse">NON-COMPLIANT</Badge>
                    )}
                  </div>
                  {po.complianceStatus === 'NON_COMPLIANT' && (
                    <p className="text-[10px] text-destructive font-semibold mt-1 italic border-l-2 border-destructive pl-2">
                      {po.complianceReason}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">${po.totalAmount}</span>
                    <div className="space-x-2">
                      <Button size="sm" variant="default" onClick={() => createMutation.mutate({ ...po, status: "approved" })}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline">
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {activeNav === "analytics" && (
        <Card>
          <CardHeader>
            <CardTitle>PO Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-blue-500/10 rounded">
                <p className="text-muted-foreground text-sm">Total POs</p>
                <p className="text-2xl font-bold">{pos.length}</p>
              </div>
              <div className="p-4 bg-amber-500/10 rounded">
                <p className="text-muted-foreground text-sm">Draft</p>
                <p className="text-2xl font-bold">{pos.filter((p: any) => p.status === "draft").length}</p>
              </div>
              <div className="p-4 bg-yellow-500/10 rounded">
                <p className="text-muted-foreground text-sm">Approved</p>
                <p className="text-2xl font-bold">{pos.filter((p: any) => p.status === "approved").length}</p>
              </div>
              <div className="p-4 bg-green-500/10 rounded">
                <p className="text-muted-foreground text-sm">Received</p>
                <p className="text-2xl font-bold">{pos.filter((p: any) => p.status === "received").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </StandardPage>
  );
}
