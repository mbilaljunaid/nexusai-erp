import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calculator, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { StandardPage } from '@/components/layout/StandardPage';

interface TaxDetail {
    code: string;
    rate: number;
    amount: number;
    exempt: boolean;
}

interface TaxCalculationResult {
    taxAmount: number;
    taxDetails: TaxDetail[];
}

export function TaxCalculator() {
    const { toast } = useToast();
    const [customerId, setCustomerId] = useState("");
    const [siteId, setSiteId] = useState("");
    const [amount, setAmount] = useState("");
    const [calculationResult, setCalculationResult] = useState<TaxCalculationResult | null>(null);

    // Fetch customers
    const { data: customers = [], isLoading: loadingCustomers } = useQuery<any[]>({
        queryKey: ["/api/ar/customers"],
    });

    // Fetch sites for selected customer
    const { data: sites = [], isLoading: loadingSites } = useQuery<any[]>({
        queryKey: ["/api/ar/customers", customerId, "sites"],
        enabled: !!customerId,
    });

    // Tax simulation mutation
    const simulateMutation = useMutation({
        mutationFn: async (data: { customerId: string; siteId: string; amount: number }) => {
            const res = await fetch("/api/tax/simulate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Simulation failed");
            }
            return res.json();
        },
        onSuccess: (data) => {
            setCalculationResult(data);
            toast({
                title: "Calculation Complete",
                description: `Total tax: $${data.taxAmount.toFixed(2)}`,
            });
        },
        onError: (error: any) => {
            toast({
                title: "Calculation Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleCalculate = () => {
        if (!customerId || !siteId || !amount) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        simulateMutation.mutate({
            customerId,
            siteId,
            amount: parseFloat(amount),
        });
    };

    const handleReset = () => {
        setCustomerId("");
        setSiteId("");
        setAmount("");
        setCalculationResult(null);
    };

    const subtotal = parseFloat(amount) || 0;
    const taxTotal = calculationResult?.taxAmount || 0;
    const grandTotal = subtotal + taxTotal;

    return (
        <StandardPage
            title="Tax Calculation Simulator"
            description="Preview tax calculations before creating invoices. Select a customer, site, and amount to see applicable taxes."
        >
            <div className="space-y-6">
                <Card>
                    <CardContent className="space-y-6 pt-6">
                        {/* Input Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="customer">Customer *</Label>
                                <Select value={customerId} onValueChange={(val) => {
                                    setCustomerId(val);
                                    setSiteId(""); // Reset site when customer changes
                                    setCalculationResult(null);
                                }}>
                                    <SelectTrigger id="customer">
                                        <SelectValue placeholder="Select customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingCustomers ? (
                                            <SelectItem value="loading" disabled>Loading...</SelectItem>
                                        ) : customers.length === 0 ? (
                                            <SelectItem value="none" disabled>No customers found</SelectItem>
                                        ) : (
                                            customers.map((customer: any) => (
                                                <SelectItem key={customer.id} value={customer.id}>
                                                    {customer.customerName}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="site">Site *</Label>
                                <Select value={siteId} onValueChange={(val) => {
                                    setSiteId(val);
                                    setCalculationResult(null);
                                }} disabled={!customerId}>
                                    <SelectTrigger id="site">
                                        <SelectValue placeholder="Select site" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingSites ? (
                                            <SelectItem value="loading" disabled>Loading...</SelectItem>
                                        ) : sites.length === 0 ? (
                                            <SelectItem value="none" disabled>No sites found</SelectItem>
                                        ) : (
                                            sites.map((site: any) => (
                                                <SelectItem key={site.id} value={site.id}>
                                                    {site.siteName}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount">Invoice Amount *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(e.target.value);
                                        setCalculationResult(null);
                                    }}
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button
                                onClick={handleCalculate}
                                disabled={simulateMutation.isPending || !customerId || !siteId || !amount}
                                className="gap-2"
                            >
                                {simulateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                Calculate Tax
                            </Button>
                            <Button variant="outline" onClick={handleReset}>
                                Reset
                            </Button>
                        </div>

                        {/* Results Section */}
                        {calculationResult && (
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-semibold text-lg">Tax Breakdown</h3>

                                {calculationResult.taxDetails.length === 0 ? (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            No applicable taxes found for this customer/site combination.
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Tax Code</TableHead>
                                                    <TableHead className="text-right">Rate</TableHead>
                                                    <TableHead className="text-right">Tax Amount</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {calculationResult.taxDetails.map((detail, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className="font-medium">{detail.code}</TableCell>
                                                        <TableCell className="text-right">
                                                            {(detail.rate * 100).toFixed(2)}%
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            ${detail.amount.toFixed(2)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {detail.exempt ? (
                                                                <Badge variant="secondary">Exempt</Badge>
                                                            ) : (
                                                                <Badge>Taxable</Badge>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>

                                        {/* Summary */}
                                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Subtotal:</span>
                                                <span className="font-mono">${subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Total Tax:</span>
                                                <span className="font-mono">${taxTotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                                <span>Grand Total:</span>
                                                <span className="font-mono">${grandTotal.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* What-If Scenarios Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">What-If Scenarios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            To test different scenarios, change the customer, site, or amount and recalculate.
                            Tax calculations are based on the site's jurisdiction, active tax codes, and any applicable exemptions.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
