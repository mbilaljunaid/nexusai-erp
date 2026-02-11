import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Calculator, FileText, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InvoiceLineItem {
    id: string;
    lineNumber: number;
    description: string;
    quantity: number;
    unitPrice: number;
    lineAmount: number;
    taxCode: string;
    taxAmount: number;
    exemptionApplied?: boolean;
    exemptionReason?: string;
}

interface TaxByJurisdiction {
    jurisdiction: string;
    taxAmount: number;
    rate: number;
}

interface TaxCalculationResult {
    invoiceId: string;
    invoiceNumber: string;
    customer: string;
    lineItems: InvoiceLineItem[];
    taxByJurisdiction: TaxByJurisdiction[];
    totalTax: number;
    totalAmount: number;
    exemptionsApplied: number;
    lastCalculated: string;
}

export function TaxCalculationPreview() {
    const queryClient = useQueryClient();
    const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
    const [calculationResult, setCalculationResult] = useState<TaxCalculationResult | null>(null);

    // Mock invoices - in real app, fetch from /api/invoices
    const mockInvoices = [
        { id: 'INV-001', number: 'INV-2024-001', customer: 'Acme Corp', amount: 15000 },
        { id: 'INV-002', number: 'INV-2024-002', customer: 'Globex Inc', amount: 8500 },
        { id: 'INV-003', number: 'INV-2024-003', customer: 'Soylent Corp', amount: 22100 },
    ];

    const calculateMutation = useMutation({
        mutationFn: async (invoiceId: string) => {
            const res = await fetch(`/api/tax/calculate/${invoiceId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) {
                // If backend returns error, use mock data for demonstration
                const selectedInvoice = mockInvoices.find(inv => inv.id === invoiceId);
                return {
                    invoiceId: invoiceId,
                    invoiceNumber: selectedInvoice?.number || 'UNKNOWN',
                    customer: selectedInvoice?.customer || 'Unknown',
                    lineItems: [
                        {
                            id: 'line-1',
                            lineNumber: 1,
                            description: 'Professional Services - Consulting',
                            quantity: 40,
                            unitPrice: 250,
                            lineAmount: 10000,
                            taxCode: 'SALES_TAX',
                            taxAmount: 800,
                            exemptionApplied: false
                        },
                        {
                            id: 'line-2',
                            lineNumber: 2,
                            description: 'Software License',
                            quantity: 5,
                            unitPrice: 1000,
                            lineAmount: 5000,
                            taxCode: 'DIGITAL_TAX',
                            taxAmount: 0,
                            exemptionApplied: true,
                            exemptionReason: 'Certificate EX-2024-001 (Non-profit exemption)'
                        }
                    ],
                    taxByJurisdiction: [
                        { jurisdiction: 'Federal', taxAmount: 600, rate: 6 },
                        { jurisdiction: 'State (CA)', taxAmount: 200, rate: 2 }
                    ],
                    totalTax: 800,
                    totalAmount: 15800,
                    exemptionsApplied: 1,
                    lastCalculated: new Date().toISOString()
                };
            }

            return res.json();
        },
        onSuccess: (data) => {
            setCalculationResult(data);
            toast({
                title: 'Tax Calculated',
                description: `Total tax: $${data.totalTax.toFixed(2)}`
            });
        },
        onError: (error: Error) => {
            toast({
                variant: 'destructive',
                title: 'Calculation Error',
                description: error.message
            });
        }
    });

    const recalculateMutation = useMutation({
        mutationFn: async () => {
            if (!selectedInvoiceId) return null;
            return calculateMutation.mutateAsync(selectedInvoiceId);
        },
        onSuccess: () => {
            toast({
                title: 'Recalculated',
                description: 'Tax amounts have been updated'
            });
        }
    });

    const handleCalculate = () => {
        if (!selectedInvoiceId) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Please select an invoice'
            });
            return;
        }

        calculateMutation.mutate(selectedInvoiceId);
    };

    return (
        <div className="space-y-6">
            {/* Invoice Selection Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Tax Calculation Preview
                    </CardTitle>
                    <CardDescription>
                        Calculate and preview tax for an invoice
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="invoiceSelect">Select Invoice</Label>
                            <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
                                <SelectTrigger id="invoiceSelect">
                                    <SelectValue placeholder="Choose an invoice" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockInvoices.map(invoice => (
                                        <SelectItem key={invoice.id} value={invoice.id}>
                                            {invoice.number} - {invoice.customer} (${invoice.amount.toLocaleString()})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end gap-2">
                            <Button
                                onClick={handleCalculate}
                                disabled={!selectedInvoiceId || calculateMutation.isPending}
                            >
                                {calculateMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Calculating...
                                    </>
                                ) : (
                                    <>
                                        <Calculator className="mr-2 h-4 w-4" />
                                        Calculate Tax
                                    </>
                                )}
                            </Button>
                            {calculationResult && (
                                <Button
                                    variant="outline"
                                    onClick={() => recalculateMutation.mutate()}
                                    disabled={recalculateMutation.isPending}
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Recalculate
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Calculation Results */}
            {calculationResult && (
                <>
                    {/* Invoice Header */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">
                                        {calculationResult.invoiceNumber}
                                    </CardTitle>
                                    <CardDescription>
                                        {calculationResult.customer}
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground">Total Tax</div>
                                    <div className="text-2xl font-bold text-green-600">
                                        ${calculationResult.totalTax.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Exemptions Applied */}
                    {calculationResult.exemptionsApplied > 0 && (
                        <Alert>
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                                {calculationResult.exemptionsApplied} exemption(s) applied to this invoice
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Line Items Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Line-by-Line Calculation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr className="border-b">
                                            <th className="p-3 text-left font-medium">#</th>
                                            <th className="p-3 text-left font-medium">Description</th>
                                            <th className="p-3 text-right font-medium">Qty</th>
                                            <th className="p-3 text-right font-medium">Unit Price</th>
                                            <th className="p-3 text-right font-medium">Amount</th>
                                            <th className="p-3 text-left font-medium">Tax Code</th>
                                            <th className="p-3 text-right font-medium">Tax</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {calculationResult.lineItems.map(line => (
                                            <tr key={line.id} className="border-b hover:bg-muted/20">
                                                <td className="p-3">{line.lineNumber}</td>
                                                <td className="p-3">
                                                    <div className="font-medium">{line.description}</div>
                                                    {line.exemptionApplied && (
                                                        <div className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Exempt: {line.exemptionReason}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3 text-right">{line.quantity}</td>
                                                <td className="p-3 text-right">
                                                    ${line.unitPrice.toFixed(2)}
                                                </td>
                                                <td className="p-3 text-right font-medium">
                                                    ${line.lineAmount.toFixed(2)}
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant="outline">{line.taxCode}</Badge>
                                                </td>
                                                <td className="p-3 text-right font-medium">
                                                    {line.exemptionApplied ? (
                                                        <span className="text-blue-600">Exempt</span>
                                                    ) : (
                                                        `$${line.taxAmount.toFixed(2)}`
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-muted/30 font-bold">
                                            <td colSpan={4} className="p-3 text-right">Subtotal:</td>
                                            <td className="p-3 text-right">
                                                ${calculationResult.lineItems.reduce((sum, line) => sum + line.lineAmount, 0).toFixed(2)}
                                            </td>
                                            <td className="p-3"></td>
                                            <td className="p-3 text-right">
                                                ${calculationResult.totalTax.toFixed(2)}
                                            </td>
                                        </tr>
                                        <tr className="bg-primary/10 font-bold text-lg">
                                            <td colSpan={6} className="p-3 text-right">Invoice Total:</td>
                                            <td className="p-3 text-right">
                                                ${calculationResult.totalAmount.toFixed(2)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tax by Jurisdiction */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Tax Summary by Jurisdiction</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {calculationResult.taxByJurisdiction.map((jurisdiction, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                                        <div>
                                            <div className="font-medium">{jurisdiction.jurisdiction}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {jurisdiction.rate}% tax rate
                                            </div>
                                        </div>
                                        <div className="text-lg font-bold">
                                            ${jurisdiction.taxAmount.toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg mt-4">
                                    <div className="font-bold">Total Tax Collected</div>
                                    <div className="text-xl font-bold text-green-600">
                                        ${calculationResult.totalTax.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Calculation Metadata */}
                    <div className="text-sm text-muted-foreground text-center">
                        Last calculated: {new Date(calculationResult.lastCalculated).toLocaleString()}
                    </div>
                </>
            )}

            {/* Empty State */}
            {!calculationResult && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">No Calculation Yet</h3>
                        <p className="text-muted-foreground">
                            Select an invoice above and click "Calculate Tax" to preview tax calculation
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
