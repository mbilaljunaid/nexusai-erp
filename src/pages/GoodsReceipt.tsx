import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, FileCheck } from "lucide-react";
import { IconNavigation } from "@/components/IconNavigation";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const inspectionSchema = z.object({
  notes: z.string().min(1, "Notes are required for this action"),
});
type InspectionValues = z.infer<typeof inspectionSchema>;

function InspectionForm({ grn, onAction }: { grn: any, onAction: (grnId: string, action: string, notes: string) => void }) {
  const form = useForm<InspectionValues>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: { notes: "" }
  });

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Inspection Notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={() => form.handleSubmit((data) => onAction(grn.id, "accepted", data.notes))()}>
            <FileCheck className="w-4 h-4 mr-2" /> Accept
          </Button>
          <Button size="sm" variant="destructive" className="flex-1" onClick={() => form.handleSubmit((data) => onAction(grn.id, "rejected", data.notes))()}>
            Reject
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => form.handleSubmit((data) => onAction(grn.id, "hold", data.notes))()}>
            Hold
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function GoodsReceipt() {
  const [activeNav, setActiveNav] = useState("list");
  const { toast } = useToast();
  const { data: grns = [] } = useQuery<any[]>({ queryKey: ["/api/procurement/goods-receipts"] });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string, status: string, qualityStatus: string, notes: string }) =>
      apiRequest("PATCH", `/api/procurement/goods-receipts/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/procurement/goods-receipts"] });
      toast({ title: "Inspection recorded successfully" });
    }
  });

  const handleInspect = (grnId: string, action: string, notes: string) => {
    updateMutation.mutate({
      id: grnId,
      status: action === "hold" ? "received" : "inspected", // Mock transition
      qualityStatus: action,
      notes
    });
  };

  const navigationItems = [
    { id: "list", label: "GRNs", icon: Package, badge: grns.length, color: "blue" as const },
    { id: "create", label: "Create GRN", icon: Plus, color: "green" as const },
    { id: "inspection", label: "For Inspection", icon: FileCheck, badge: grns.filter((g: any) => g.status === "received").length, color: "orange" as const },
    { id: "analytics", label: "Analytics", icon: Package, color: "purple" as const },
  ];

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    received: "secondary",
    inspected: "default",
    accepted: "default",
    rejected: "destructive",
    partial: "secondary",
  };

  return (
    <StandardPage
      title="Goods Rt Notes (GRN)"
      description="Track incoming goods, perform quality checks, and match with POs"
    >

      <IconNavigation items={navigationItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "list" && (
        <div className="grid gap-4">
          {grns.map((grn: any) => (
            <Card key={grn.id} className="hover-elevate">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{grn.grnNumber}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">PO: {grn.poId}</p>
                  </div>
                  <Badge variant={statusColors[grn.status] || "default"}>{grn.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Qty</p>
                    <p className="font-semibold">{grn.totalQuantity} units</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Received Date</p>
                    <p className="font-semibold">{formatDate(grn.receivedDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Quality</p>
                    <Badge variant={grn.qualityStatus === "accepted" ? "default" : grn.qualityStatus === "rejected" ? "destructive" : "secondary"}>
                      {grn.qualityStatus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeNav === "inspection" && (
        <div className="space-y-4">
          <p className="text-lg font-semibold">{grns.filter((g: any) => g.status === "received").length} GRNs awaiting inspection</p>
          {grns
            .filter((g: any) => g.status === "received")
            .map((grn: any) => (
              <Card key={grn.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{grn.grnNumber}</CardTitle>
                </CardHeader>
                <CardContent>
                  <InspectionForm grn={grn} onAction={handleInspect} />
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {activeNav === "analytics" && (
        <Card>
          <CardHeader>
            <CardTitle>GRN Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-blue-500/10 rounded">
                <p className="text-muted-foreground text-sm">Total GRNs</p>
                <p className="text-2xl font-bold">{grns.length}</p>
              </div>
              <div className="p-4 bg-yellow-500/10 rounded">
                <p className="text-muted-foreground text-sm">Received</p>
                <p className="text-2xl font-bold">{grns.filter((g: any) => g.status === "received").length}</p>
              </div>
              <div className="p-4 bg-green-500/10 rounded">
                <p className="text-muted-foreground text-sm">Accepted</p>
                <p className="text-2xl font-bold">{grns.filter((g: any) => g.status === "accepted").length}</p>
              </div>
              <div className="p-4 bg-red-500/10 rounded">
                <p className="text-muted-foreground text-sm">Rejected</p>
                <p className="text-2xl font-bold">{grns.filter((g: any) => g.status === "rejected").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </StandardPage>
  );
}
