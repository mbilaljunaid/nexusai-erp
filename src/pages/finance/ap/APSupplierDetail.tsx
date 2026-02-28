import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, Loader2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function APSupplierDetail() {
    const [, params] = useRoute("/finance/ap/suppliers/:id");
    const supplierId = (params as any)?.id;
    const { toast } = useToast();

    const { data: supplier, isLoading } = useQuery<any>({
        queryKey: [`/api/ap/suppliers/${supplierId}`],
        enabled: !!supplierId,
        queryFn: async () => {
            const res = await fetch(`/api/erp/suppliers/${supplierId}`);
            if (!res.ok) {
                // Try alternate route if ERP unified endpoint fails
                const fallback = await fetch(`/api/ap/suppliers/${supplierId}`);
                if (!fallback.ok) throw new Error("Failed to fetch supplier");
                return fallback.json();
            }
            return res.json();
        }
    });

    const toggleHoldMutation = useMutation({
        mutationFn: ({ id, hold }: { id: string, hold: boolean }) =>
            fetch(`/api/ap/suppliers/${id}/hold`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hold })
            }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/ap/suppliers/${supplierId}`] });
            queryClient.invalidateQueries({ queryKey: ["/api/ap/suppliers"] });
            toast({ title: "Credit hold status updated" });
        }
    });

    if (isLoading) return <div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    if (!supplier) return <div className="p-8 text-center text-muted-foreground">Supplier not found.</div>;

    return (
        <StandardPage
            title={`Supplier: ${supplier.name}`}
            description="Manage supplier master data, sites, and account standing."
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Accounts Payable", href: "/finance/ap" },
                { label: "Suppliers", href: "/finance/ap/suppliers" },
                { label: supplier.supplierNumber || "Details" }
            ]}
            actions={
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => toggleHoldMutation.mutate({ id: supplier.id, hold: !supplier.onHold })}
                        disabled={toggleHoldMutation.isPending}
                    >
                        {supplier.onHold ? (
                            <><Unlock className="h-4 w-4 mr-2" /> Release Hold</>
                        ) : (
                            <><Lock className="h-4 w-4 mr-2 text-destructive" /> <span className="text-destructive">Place Hold</span></>
                        )}
                    </Button>
                    <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" /> Edit Details
                    </Button>
                </div>
            }
        >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Business Unit</CardTitle></CardHeader>
                    <CardContent><div className="text-lg font-medium">{supplier.businessUnitId || "System Default"}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Supplier Number</CardTitle></CardHeader>
                    <CardContent><div className="text-xl font-bold font-mono">{supplier.supplierNumber}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Tax ID</CardTitle></CardHeader>
                    <CardContent><div className="text-lg font-medium">{supplier.taxId || "Not Provided"}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-primary">${parseFloat(supplier.totalBalance || 0).toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-2">
                        <Badge variant={supplier.status === "Active" ? "default" : "secondary"}>{supplier.status || "Active"}</Badge>
                        {supplier.onHold && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                                <Lock className="h-3 w-3" /> On Hold
                            </Badge>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Supplier Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Payment Terms</div>
                        <div className="text-base">{supplier.paymentTerms || "Net 30"}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Withholding Tax Configured</div>
                        <div className="text-base">{supplier.allowWithholdingTax ? "Yes" : "No"}</div>
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
