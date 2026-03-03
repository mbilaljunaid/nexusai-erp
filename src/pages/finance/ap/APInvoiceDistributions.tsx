import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, Network } from "lucide-react";
import { StandardPage } from '@/components/layout/StandardPage';

interface DistributionLine {
    id?: string;
    lineNumber: number;
    distributionLineType: string;
    amount: string;
    description: string;
    glAccountId: string;
    accountingDate?: string;
    ppmProjectId?: string;
    ppmTaskId?: string;
    expenditureItemDate?: string;
    expenditureType?: string;
}

interface APInvoiceDistributionsProps {
    invoiceId: string;
    invoiceLineId: string;
    lineAmount: number;
    onClose?: () => void;
}

export function APInvoiceDistributions({ invoiceId, invoiceLineId, lineAmount, onClose }: APInvoiceDistributionsProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [distributions, setDistributions] = useState<DistributionLine[]>([
        {
            lineNumber: 1,
            distributionLineType: "ITEM",
            amount: lineAmount.toString(),
            description: "",
            glAccountId: "",
            accountingDate: new Date().toISOString().split("T")[0]
        }
    ]);

    const { data: accounts } = useQuery({
        queryKey: ["/api/gl/accounts"],
        queryFn: () => fetch("/api/gl/accounts").then(r => r.json()),
    });

    const addDistribution = () => {
        setDistributions([...distributions, {
            lineNumber: distributions.length + 1,
            distributionLineType: "ITEM",
            amount: "0",
            description: "",
            glAccountId: "",
            accountingDate: new Date().toISOString().split("T")[0]
        }]);
    };

    const removeDistribution = (index: number) => {
        setDistributions(distributions.filter((_, i) => i !== index).map((d, i) => ({ ...d, lineNumber: i + 1 })));
    };

    const handleDistributionChange = (index: number, field: string, value: string) => {
        const newDistributions = [...distributions];
        newDistributions[index] = { ...newDistributions[index], [field]: value };
        setDistributions(newDistributions);
    };

    const calculateTotal = () => {
        return distributions.reduce((sum, d) => sum + parseFloat(d.amount || "0"), 0);
    };

    const handleSave = async () => {
        const totalAmount = calculateTotal();
        if (Math.abs(totalAmount - lineAmount) > 0.01) {
            toast({
                title: "Validation Error",
                description: `Distribution total (${totalAmount.toFixed(2)}) must equal line amount (${lineAmount.toFixed(2)}). Variance: ${Math.abs(totalAmount - lineAmount).toFixed(2)}`,
                variant: "destructive"
            });
            return;
        }

        const invalidDistributions = distributions.filter(d => !d.glAccountId || !d.amount);
        if (invalidDistributions.length > 0) {
            toast({
                title: "Validation Error",
                description: "All distributions must have an amount and GL Account.",
                variant: "destructive"
            });
            return;
        }

        try {
            await Promise.all(distributions.map(dist =>
                fetch(`/api/ap/invoices/${invoiceId}/lines/${invoiceLineId}/distributions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        distributionLineNumber: dist.lineNumber,
                        amount: dist.amount,
                        distributionLineType: dist.distributionLineType,
                        description: dist.description,
                        glAccountId: dist.glAccountId,
                        accountingDate: dist.accountingDate ? new Date(dist.accountingDate).toISOString() : null,
                        ppmProjectId: dist.ppmProjectId,
                        ppmTaskId: dist.ppmTaskId,
                        expenditureItemDate: dist.expenditureItemDate ? new Date(dist.expenditureItemDate).toISOString() : null,
                        expenditureType: dist.expenditureType
                    })
                })
            ));

            toast({ title: "Distributions saved successfully" });
            queryClient.invalidateQueries({ queryKey: ["/api/ap/invoices", invoiceId] });
            if (onClose) onClose();
        } catch (error: any) {
            toast({ title: "Failed to save distributions", description: error.message, variant: "destructive" });
        }
    };

    const totalCalculated = calculateTotal();
    const isBalanced = Math.abs(totalCalculated - lineAmount) <= 0.01;

    return (
        <StandardPage
            title={<><Network className="h-5 w-5 text-blue-600 inline-block mr-2" /> Line Distributions</>}
            description="Manage accounting splits for this invoice line."
            actions={
                <div className="flex gap-2 text-sm font-medium">
                    <div className="px-3 py-1 bg-slate-100 rounded text-slate-700">
                        Line Amount: ${lineAmount.toFixed(2)}
                    </div>
                    <div className={`px-3 py-1 rounded ${isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        Distributed: ${totalCalculated.toFixed(2)}
                    </div>
                </div>
            }
        >
            <Card className="border-slate-200 shadow-sm mt-4">
                <CardContent className="p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100/50 text-slate-500 border-b">
                            <tr>
                                <th className="px-4 py-3 font-medium w-16">No.</th>
                                <th className="px-4 py-3 font-medium w-40">Type</th>
                                <th className="px-4 py-3 font-medium w-40">GL Date</th>
                                <th className="px-4 py-3 font-medium w-64">GL Account</th>
                                <th className="px-4 py-3 font-medium w-32">Amount</th>
                                <th className="px-4 py-3 font-medium">Description</th>
                                <th className="px-4 py-3 font-medium w-48">Project (PPM)</th>
                                <th className="px-4 py-3 font-medium w-24 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {distributions.map((dist, index) => (
                                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 text-center text-slate-500 font-medium">{dist.lineNumber}</td>
                                    <td className="px-4 py-3">
                                        <Select value={dist.distributionLineType} onValueChange={v => handleDistributionChange(index, "distributionLineType", v)}>
                                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ITEM">Item</SelectItem>
                                                <SelectItem value="ACCRUAL">Accrual</SelectItem>
                                                <SelectItem value="TAX">Tax</SelectItem>
                                                <SelectItem value="VARIANCE">Variance</SelectItem>
                                                <SelectItem value="PREPAYMENT">Prepayment</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Input
                                            type="date"
                                            className="h-8 text-xs"
                                            value={dist.accountingDate || ""}
                                            onChange={e => handleDistributionChange(index, "accountingDate", e.target.value)}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Select value={dist.glAccountId || undefined} onValueChange={v => handleDistributionChange(index, "glAccountId", v)}>
                                            <SelectTrigger className="h-8 text-xs font-mono"><SelectValue placeholder="Select Account" /></SelectTrigger>
                                            <SelectContent>
                                                {Array.isArray(accounts) ? accounts.map((acc: any) => (
                                                    <SelectItem key={acc.id} value={acc.id} className="font-mono text-xs">
                                                        {acc.accountCode} - {acc.description}
                                                    </SelectItem>
                                                )) : null}
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Input
                                            type="number"
                                            className="h-8 text-xs text-right"
                                            value={dist.amount}
                                            onChange={e => handleDistributionChange(index, "amount", e.target.value)}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Input
                                            className="h-8 text-xs"
                                            placeholder="Description..."
                                            value={dist.description}
                                            onChange={e => handleDistributionChange(index, "description", e.target.value)}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Input
                                            className="h-8 text-xs font-mono"
                                            placeholder="Project #"
                                            value={dist.ppmProjectId || ""}
                                            onChange={e => handleDistributionChange(index, "ppmProjectId", e.target.value)}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="sm" onClick={() => removeDistribution(index)} disabled={distributions.length === 1} className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex justify-between items-center p-4 border-t bg-slate-50">
                        <Button variant="outline" size="sm" onClick={addDistribution} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                            <Plus className="mr-2 h-4 w-4" /> Add Split
                        </Button>
                        <div className="flex gap-2">
                            {onClose && <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>}
                            <Button size="sm" onClick={handleSave} disabled={!isBalanced}>
                                <Save className="mr-2 h-4 w-4" /> Save Distributions
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </StandardPage>
    );
}
