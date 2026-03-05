import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from "@/components/layout/StandardPage";


export default function FreightAudit() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    const { data: invoices } = useQuery<any>({
        queryKey: ["/api/transportation/freight-invoices"],
        queryFn: () => apiRequest("GET", "/api/transportation/freight-invoices?status=PENDING_AUDIT").then(res => res.json()),
    });

    const approveMutation = useMutation({
        mutationFn: (invoiceId: number) =>
            apiRequest("POST", `/api/transportation/freight-invoices/${invoiceId}/approve`),
        onSuccess: () => {
            toast({ title: "Success", description: "Invoice approved for payment" });
            queryClient.invalidateQueries({ queryKey: ["/api/transportation/freight-invoices"] });
            setSelectedInvoice(null);
        },
    });

    const disputeMutation = useMutation({
        mutationFn: ({ invoiceId, reason }: { invoiceId: number; reason: string }) =>
            apiRequest("POST", `/api/transportation/freight-invoices/${invoiceId}/dispute`, { reason }),
        onSuccess: () => {
            toast({ title: "Success", description: "Invoice disputed" });
            queryClient.invalidateQueries({ queryKey: ["/api/transportation/freight-invoices"] });
            setSelectedInvoice(null);
        },
    });

    return (
        <StandardPage title="Freight Audit & Payment">
            <div>
                
                <p className="text-muted-foreground">Automated freight invoice validation and discrepancy detection</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Pending Audits</div>
                        <div className="text-3xl font-bold mt-1">{invoices?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Total Amount</div>
                        <div className="text-3xl font-bold mt-1">
                            ${invoices?.reduce((sum: number, inv: any) => sum + inv.amount, 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Discrepancies Found</div>
                        <div className="text-3xl font-bold mt-1 text-orange-600">
                            {invoices?.filter((inv: any) => inv.hasDiscrepancy).length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Potential Savings</div>
                        <div className="text-3xl font-bold mt-1 text-green-600">
                            ${invoices?.reduce((sum: number, inv: any) => sum + (inv.potentialSavings || 0), 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-12 gap-6">
                <Card className="col-span-5">
                    <CardHeader>
                        <CardTitle>Pending Invoices</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                        {invoices?.map((invoice: any) => (
                            <div
                                key={invoice.id}
                                className={`p-3 rounded-lg cursor-pointer border ${selectedInvoice?.id === invoice.id
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:bg-accent"
                                    }`}
                                onClick={() => setSelectedInvoice(invoice)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-medium">{invoice.invoiceNumber}</div>
                                        <div className="text-sm text-muted-foreground">{invoice.carrier}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">${invoice.amount.toLocaleString()}</div>
                                        {invoice.hasDiscrepancy && (
                                            <Badge variant="destructive" className="mt-1">
                                                Discrepancy
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="col-span-7">
                    <CardHeader>
                        <CardTitle>Invoice Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedInvoice ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Invoice Number</div>
                                        <div className="font-medium">{selectedInvoice.invoiceNumber}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Carrier</div>
                                        <div className="font-medium">{selectedInvoice.carrier}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Shipment Date</div>
                                        <div className="font-medium">
                                            {new Date(selectedInvoice.shipmentDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Invoice Date</div>
                                        <div className="font-medium">
                                            {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">Charges Breakdown</h3>
                                    <div className="border rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span>Base Freight Charge</span>
                                            <span className="font-medium">${selectedInvoice.baseCharge?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Fuel Surcharge</span>
                                            <span className="font-medium">${selectedInvoice.fuelSurcharge?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Accessorial Charges</span>
                                            <span className="font-medium">${selectedInvoice.accessorialCharges?.toLocaleString()}</span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between font-bold">
                                            <span>Total</span>
                                            <span>${selectedInvoice.amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedInvoice.discrepancies && selectedInvoice.discrepancies.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-2 flex items-center text-orange-600">
                                            <AlertCircle className="h-4 w-4 mr-2" />
                                            Identified Discrepancies
                                        </h3>
                                        <div className="space-y-2">
                                            {selectedInvoice.discrepancies.map((disc: any, i: number) => (
                                                <div key={i} className="border rounded-lg p-3 bg-orange-50">
                                                    <div className="font-medium">{disc.type}</div>
                                                    <div className="text-sm text-muted-foreground">{disc.description}</div>
                                                    <div className="text-sm mt-1">
                                                        Amount at risk: <span className="font-bold text-orange-600">${disc.amount}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 justify-end border-t pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => disputeMutation.mutate({ invoiceId: selectedInvoice.id, reason: "Discrepancy found" })}
                                        disabled={disputeMutation.isPending}
                                    >
                                        <AlertCircle className="h-4 w-4 mr-2" />
                                        Dispute
                                    </Button>
                                    <Button
                                        onClick={() => approveMutation.mutate(selectedInvoice.id)}
                                        disabled={approveMutation.isPending}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve for Payment
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                <FileText className="h-12 w-12 mb-4" />
                                <p>Select an invoice to review</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
