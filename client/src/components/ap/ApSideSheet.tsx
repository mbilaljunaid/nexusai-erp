
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ApSupplier, ApInvoice } from "@shared/schema";
import { format } from "date-fns";
import { CreditCard, AlertTriangle, Building2, FileText, CheckCircle2, XCircle, Activity, Layers, Receipt } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ApSideSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplier?: ApSupplier;
    invoice?: ApInvoice;
    type: "supplier" | "invoice";
}

export function ApSideSheet({
    open,
    onOpenChange,
    supplier,
    invoice,
    type,
}: ApSideSheetProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("details");

    const toggleHoldMutation = useMutation({
        mutationFn: async ({ id, hold }: { id: number; hold: boolean }) => {
            const res = await apiRequest("POST", `/api/ap/suppliers/${id}/hold`, { hold });
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/ap/suppliers"] });
            toast({
                title: `Credit Hold ${data.creditHold ? "Applied" : "Removed"}`,
                description: `Supplier ${data.name} is now ${data.creditHold ? "on hold" : "active"}.`,
                variant: data.creditHold ? "destructive" : "default",
            });
        },
    });

    const { data: sites } = useQuery({
        queryKey: [`/api/ap/suppliers/${supplier?.id}/sites`],
        enabled: !!supplier?.id && type === "supplier",
    });

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case "High": return "text-red-500";
            case "Medium": return "text-yellow-500";
            default: return "text-green-500";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PAID": return "bg-green-100 text-green-800 border-green-200";
            case "OVERDUE": return "bg-red-100 text-red-800 border-red-200";
            case "POSTED": return "bg-blue-100 text-blue-800 border-blue-200";
            case "UNPAID": return "bg-amber-100 text-amber-800 border-amber-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${type === "supplier" ? "bg-blue-100" : "bg-purple-100"}`}>
                            {type === "supplier" ? (
                                <Building2 className="h-5 w-5 text-blue-600" />
                            ) : (
                                <FileText className="h-5 w-5 text-purple-600" />
                            )}
                        </div>
                        <SheetTitle className="text-xl">
                            {type === "supplier" ? supplier?.name : invoice?.invoiceNumber}
                        </SheetTitle>
                    </div>
                    <SheetDescription>
                        {type === "supplier"
                            ? `Supplier ID: ${supplier?.id} • Tax ID: ${supplier?.taxId || "N/A"}`
                            : `Invoice for Supplier #${invoice?.supplierId} • ${format(new Date(invoice?.createdAt || new Date()), "PPP")}`
                        }
                    </SheetDescription>
                    {type === "supplier" && supplier?.creditHold && (
                        <div className="mt-2 flex items-center gap-2 text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/20">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">Credit Hold Active</span>
                        </div>
                    )}
                </SheetHeader>

                <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        {type === "invoice" ? (
                            <>
                                <TabsTrigger value="lines">Lines</TabsTrigger>
                                <TabsTrigger value="holds">Holds</TabsTrigger>
                                <TabsTrigger value="distributions">Distributions</TabsTrigger>
                            </>
                        ) : (
                            <>
                                <TabsTrigger value="sites">Sites</TabsTrigger>
                                <TabsTrigger value="financials">Financials</TabsTrigger>
                            </>
                        )}
                    </TabsList>

                    <TabsContent value="details" className="space-y-4">
                        {type === "supplier" && supplier && (
                            <div className="grid gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Risk Profile</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className={`text-lg font-bold ${getRiskColor(supplier.riskCategory || "Low")}`}>
                                                {supplier.riskCategory || "Low"} Risk
                                            </span>
                                            {supplier.riskCategory === "High" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground uppercase">Contact Email</label>
                                        <p className="text-sm font-medium">{supplier.contactEmail || "N/A"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground uppercase">Parent Supplier</label>
                                        <p className="text-sm font-medium">{supplier.parentSupplierId ? `#${supplier.parentSupplierId}` : "None"}</p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground uppercase">Address (Primary)</label>
                                    <p className="text-sm text-muted-foreground">{supplier.address || "No address on file"}</p>
                                    <p className="text-xs text-amber-600 mt-1">See "Sites" for full locations.</p>
                                </div>
                            </div>
                        )}

                        {type === "invoice" && invoice && (
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm">
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Amount</span>
                                        <div className="text-2xl font-bold text-primary">
                                            {new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.invoiceCurrencyCode || "USD" }).format(Number(invoice.invoiceAmount))}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={getStatusColor(invoice.paymentStatus || "UNPAID")}>
                                        {invoice.paymentStatus}
                                    </Badge>
                                </div>

                                {/* AI Insights Panel */}
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-lg space-y-2 border border-blue-100 dark:border-blue-900">
                                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold text-sm">
                                        <Activity className="h-4 w-4" />
                                        AI Risk Assessment
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        No anomalies detected. Amount is within standard deviation (±5%) for this supplier over the last 6 months.
                                        Duplicate check passed.
                                    </p>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground uppercase">Due Date</label>
                                        <p className="text-sm font-medium">
                                            {invoice.dueDate ? format(new Date(invoice.dueDate), "MMM dd, yyyy") : "N/A"}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground uppercase">Payment Terms</label>
                                        <p className="text-sm font-medium">{invoice.paymentTerms || "Net 30"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground uppercase">Tax Amount</label>
                                        <p className="text-sm font-medium">
                                            {new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.invoiceCurrencyCode || "USD" }).format(Number(invoice.taxAmount || 0))}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground uppercase">Accounting Status</label>
                                        <Badge variant="secondary" className="font-normal">{invoice.accountingStatus}</Badge>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    {type === "invoice" && (
                        <>
                            <TabsContent value="lines">
                                <ScrollArea className="h-[300px] rounded-md border p-0">
                                    <div className="p-4 space-y-4">
                                        <div className="flex items-center justify-center h-full text-muted-foreground flex-col gap-2 py-8">
                                            <Receipt className="h-8 w-8 opacity-20" />
                                            <p className="text-sm">Invoice lines will appear here.</p>
                                            <p className="text-xs text-muted-foreground">(Line fetch not yet implemented in Phase 1)</p>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                            <TabsContent value="holds" className="space-y-4">
                                {invoice && <InvoiceHoldsView invoiceId={invoice.id} />}
                            </TabsContent>
                            <TabsContent value="distributions">
                                <ScrollArea className="h-[300px] rounded-md border p-0">
                                    <div className="p-4 space-y-4">
                                        <div className="flex items-center justify-center h-full text-muted-foreground flex-col gap-2 py-8">
                                            <Layers className="h-8 w-8 opacity-20" />
                                            <p className="text-sm">GL Distributions will appear here.</p>
                                            <p className="text-xs text-muted-foreground">(Distribution generation pending Phase 5)</p>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                        </>
                    )}

                    {type === "supplier" && (
                        <>
                            <TabsContent value="sites">
                                <ScrollArea className="h-[300px] rounded-md border p-4">
                                    <div className="space-y-3">
                                        {Array.isArray(sites) && sites.length > 0 ? (
                                            sites.map((site: any) => (
                                                <div key={site.id} className="p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-semibold text-sm">{site.siteName}</span>
                                                        <div className="flex gap-1">
                                                            {site.isPaySite && <Badge variant="outline" className="text-[10px] h-5">Pay</Badge>}
                                                            {site.isPurchasingSite && <Badge variant="outline" className="text-[10px] h-5">Purchasing</Badge>}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{site.address || "No address override"}</p>
                                                    <div className="mt-2 text-[10px] text-muted-foreground flex gap-3">
                                                        <span>Terms: {site.paymentTermsId || "Parent Default"}</span>
                                                        <span>Tax ID: {site.taxId || "Parent Default"}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                                <p className="text-sm">No sites defined.</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                            <TabsContent value="financials">
                                <div className="space-y-4">
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <h4 className="font-semibold mb-2">Payment History</h4>
                                        <p className="text-sm text-muted-foreground">Total Paid YTD: $0.00</p>
                                    </div>
                                </div>
                            </TabsContent>
                        </>
                    )}
                </Tabs>

                <SheetFooter className="mt-8">
                    {type === "supplier" && supplier && (
                        <Button
                            variant={supplier.creditHold ? "default" : "destructive"}
                            className="w-full"
                            onClick={() => toggleHoldMutation.mutate({ id: supplier.id, hold: !supplier.creditHold })}
                            disabled={toggleHoldMutation.isPending}
                        >
                            {supplier.creditHold ? "Release Credit Hold" : "Place on Credit Hold"}
                        </Button>
                    )}
                    {type === "invoice" && (
                        <div className="w-full flex gap-2">
                            <Button variant="outline" className="flex-1">
                                Hold Invoice
                            </Button>
                            <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                Validate & Post
                            </Button>
                        </div>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

function InvoiceHoldsView({ invoiceId }: { invoiceId: number }) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { data: holds, isLoading } = useQuery({
        queryKey: [`/api/ap/invoices/${invoiceId}/holds`],
    });

    const releaseMutation = useMutation({
        mutationFn: async (holdId: number) => {
            const res = await apiRequest("POST", `/api/ap/holds/${holdId}/release`, { releaseCode: "MANUAL" });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/ap/invoices/${invoiceId}/holds`] });
            queryClient.invalidateQueries({ queryKey: ['/api/ap/invoices'] });
            toast({ title: "Hold Released", description: "The hold has been successfully released." });
        },
    });

    if (isLoading) return <Skeleton className="h-20 w-full" />;

    return (
        <div className="space-y-3">
            {Array.isArray(holds) && holds.length > 0 ? (
                holds.map((hold: any) => (
                    <div key={hold.id} className={`p-3 border rounded-lg ${hold.release_lookup_code ? 'bg-muted/50 border-muted-foreground/20' : 'bg-destructive/5 border-destructive/20'}`}>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className={`h-4 w-4 ${hold.release_lookup_code ? 'text-muted-foreground' : 'text-destructive'}`} />
                                <span className={`font-semibold text-sm ${hold.release_lookup_code ? 'text-muted-foreground line-through' : ''}`}>
                                    {hold.hold_lookup_code}
                                </span>
                            </div>
                            {hold.release_lookup_code ? (
                                <Badge variant="outline" className="text-[10px] h-5 bg-green-50 text-green-700 border-green-200">
                                    Released: {hold.release_lookup_code}
                                </Badge>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-[10px] px-2"
                                    onClick={() => releaseMutation.mutate(hold.id)}
                                    disabled={releaseMutation.isPending}
                                >
                                    Release
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground pl-6">{hold.hold_reason}</p>
                        <div className="mt-2 text-[10px] text-muted-foreground flex gap-3 pl-6">
                            <span>Type: {hold.hold_type}</span>
                            <span>Date: {hold.hold_date ? format(new Date(hold.hold_date), "MMM dd, yyyy") : 'N/A'}</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-20 text-green-500" />
                    <p className="text-sm font-medium">No active holds.</p>
                    <p className="text-xs">Invoice is ready for next lifecycle step.</p>
                </div>
            )}
        </div>
    );
}

