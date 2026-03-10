import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, Network } from "lucide-react";
import { StandardPage } from '@/components/layout/StandardPage';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { DatePicker } from '@/components/ui/DatePicker';

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

    const { data: accounts } = useQuery<any>({
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

    const distColumns: SpreadsheetColumn<DistributionLine>[] = [
        { id: "lineNumber", header: "No.", width: "80px", cell: (row) => <div className="text-center text-muted-foreground font-medium">{row.lineNumber}</div> },
        {
            id: "type", header: "Type", width: "160px", cell: (row) => (
                <Select value={row.distributionLineType} onValueChange={v => handleDistributionChange(row.lineNumber - 1, "distributionLineType", v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ITEM">Item</SelectItem>
                        <SelectItem value="ACCRUAL">Accrual</SelectItem>
                        <SelectItem value="TAX">Tax</SelectItem>
                        <SelectItem value="VARIANCE">Variance</SelectItem>
                        <SelectItem value="PREPAYMENT">Prepayment</SelectItem>
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "glDate", header: "GL Date", width: "160px", cell: (row) => (
                <DatePicker className="h-8 text-xs w-full" value={row.accountingDate || ""} onChange={v => handleDistributionChange(row.lineNumber - 1, "accountingDate", v)} />
            )
        },
        {
            id: "glAccount", header: "GL Account", width: "250px", cell: (row) => (
                <Select value={row.glAccountId || undefined} onValueChange={v => handleDistributionChange(row.lineNumber - 1, "glAccountId", v)}>
                    <SelectTrigger className="h-8 text-xs font-mono"><SelectValue placeholder="Select Account" /></SelectTrigger>
                    <SelectContent>
                        {Array.isArray(accounts) ? accounts.map((acc: any) => (
                            <SelectItem key={acc.id} value={acc.id} className="font-mono text-xs">
                                {acc.accountCode} - {acc.description}
                            </SelectItem>
                        )) : null}
                    </SelectContent>
                </Select>
            )
        },
        {
            id: "amount", header: "Amount", width: "120px", cell: (row) => (
                <Input type="number" className="h-8 text-xs text-right w-full" value={row.amount} onChange={e => handleDistributionChange(row.lineNumber - 1, "amount", e.target.value)} />
            )
        },
        {
            id: "desc", header: "Description", width: "200px", cell: (row) => (
                <Input className="h-8 text-xs w-full" placeholder="Description..." value={row.description} onChange={e => handleDistributionChange(row.lineNumber - 1, "description", e.target.value)} />
            )
        },
        {
            id: "project", header: "Project (PPM)", width: "150px", cell: (row) => (
                <Input className="h-8 text-xs font-mono w-full" placeholder="Project #" value={row.ppmProjectId || ""} onChange={e => handleDistributionChange(row.lineNumber - 1, "ppmProjectId", e.target.value)} />
            )
        },
        {
            id: "actions", header: "Actions", width: "80px", cell: (row) => (
                <div className="flex justify-center w-full">
                    <Button variant="ghost" size="sm" onClick={() => removeDistribution(row.lineNumber - 1)} disabled={distributions.length === 1} className="h-8 w-8 p-0 px-2 text-red-500 hover:text-red-700 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <StandardPage
            title={<><Network className="h-5 w-5 text-blue-600 inline-block mr-2" /> Line Distributions</>}
            description="Manage accounting splits for this invoice line."
            actions={
                <div className="flex gap-2 text-sm font-medium">
                    <div className="px-3 py-1 bg-muted rounded text-foreground/90">
                        Line Amount: ${lineAmount.toFixed(2)}
                    </div>
                    <div className={cn(`px-3 py-1 rounded ${isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`)}>
                        Distributed: ${totalCalculated.toFixed(2)}
                    </div>
                </div>
            }
        >
            <Card className="border-border shadow-sm mt-4">
                <CardContent className="p-0 border-b">
                    <InteractiveSpreadsheet
                        columns={distColumns}
                        data={distributions}
                        onChange={() => { }}
                        containerHeight="400px"
                    />
                    <div className="flex justify-between items-center p-4 border-t bg-slate-500/10">
                        <Button variant="outline" size="sm" onClick={addDistribution} className="text-blue-600 border-blue-200 hover:bg-blue-500/10">
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
