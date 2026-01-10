
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
import { ApSupplier, ApInvoice } from "@shared/schema";
import { format } from "date-fns";
import { CreditCard, AlertTriangle, Building2, FileText, CheckCircle2, XCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case "High": return "text-red-500";
            case "Medium": return "text-yellow-500";
            default: return "text-green-500";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Paid": return "bg-green-100 text-green-800";
            case "Overdue": return "bg-red-100 text-red-800";
            case "Posted": return "bg-blue-100 text-blue-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="flex items-center gap-2">
                        {type === "supplier" ? (
                            <Building2 className="h-6 w-6 text-primary" />
                        ) : (
                            <FileText className="h-6 w-6 text-primary" />
                        )}
                        <SheetTitle className="text-xl">
                            {type === "supplier" ? supplier?.name : invoice?.invoiceNumber}
                        </SheetTitle>
                    </div>
                    <SheetDescription>
                        {type === "supplier"
                            ? `Supplier ID: ${supplier?.id} • Tax ID: ${supplier?.taxId || "N/A"}`
                            : `Invoice for ${invoice?.supplierId} • ${format(new Date(invoice?.createdAt || new Date()), "PPP")}`
                        }
                    </SheetDescription>
                    {type === "supplier" && supplier?.creditHold && (
                        <div className="mt-2 flex items-center gap-2 text-destructive bg-destructive/10 p-2 rounded-md">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">Credit Hold Active</span>
                        </div>
                    )}
                </SheetHeader>

                <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                        <TabsTrigger value="financials">Financials</TabsTrigger>
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
                                    <label className="text-xs text-muted-foreground uppercase">Address</label>
                                    <p className="text-sm text-muted-foreground">{supplier.address || "No address on file"}</p>
                                </div>
                            </div>
                        )}

                        {type === "invoice" && invoice && (
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground uppercase">Total Amount</span>
                                        <div className="text-2xl font-bold">
                                            {new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.invoiceCurrencyCode || "USD" }).format(Number(invoice.invoiceAmount))}
                                        </div>
                                    </div>
                                    <Badge className={getStatusColor(invoice.paymentStatus || "UNPAID")}>
                                        {invoice.paymentStatus}
                                    </Badge>
                                </div>

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
                                        <label className="text-xs text-muted-foreground uppercase">Recognition</label>
                                        <Badge variant="outline">{invoice.accountingStatus}</Badge>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="activity">
                        <ScrollArea className="h-[300px] rounded-md border p-4">
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground text-center py-8">No recent activity logged.</p>
                                {/* Placeholder for real activity log */}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="financials">
                        <div className="space-y-4">
                            {type === "supplier" && (
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <h4 className="font-semibold mb-2">Payment History</h4>
                                    <p className="text-sm text-muted-foreground">Total Paid YTD: $0.00</p>
                                </div>
                            )}
                            {type === "invoice" && (
                                <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    <div>
                                        <h4 className="font-semibold text-sm">Payment Method</h4>
                                        <p className="text-xs text-muted-foreground">Electronic Transfer (Default)</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>
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
                        <Button className="w-full">
                            Proceed to Payment
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
