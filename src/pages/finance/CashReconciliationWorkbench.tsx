import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Plus, RefreshCw, Upload } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { AccountSummaryCards } from "@/components/finance/AccountSummaryCards";
import { ReconciliationSplitView } from "@/components/finance/ReconciliationSplitView";
import { StatementUploadDialog } from "@/components/finance/StatementUploadDialog";
import { CashBankAccount } from "@shared/schema";

export default function CashReconciliationWorkbench() {
    const { toast } = useToast();
    const [selectedAccountId, setSelectedAccountId] = useState<string>("");
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const { data: accounts = [], isLoading: loadingAccounts } = useQuery<CashBankAccount[]>({
        queryKey: ["/api/finance/cash/accounts"],
    });

    const selectedAccount = accounts.find(a => a.id === selectedAccountId);

    const autoReconcileMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/finance/cash/accounts/${id}/reconcile`, { method: "POST" });
            if (!res.ok) throw new Error("Auto-reconciliation failed");
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [`/api/finance/cash/accounts/${selectedAccountId}/statement-lines`] });
            queryClient.invalidateQueries({ queryKey: [`/api/finance/cash/accounts/${selectedAccountId}/transactions`] });
            toast({
                title: "Auto-Reconciliation Complete",
                description: `Matched ${data.matchedCount} items with ${data.totalAmount} total value.`
            });
        },
    });

    return (
        <StandardPage title="Cash Reconciliation Workbench">
            <PageHeader
                title="Reconciliation"
                description="Match bank statement lines with internal cash transactions"
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsUploadOpen(true)}>
                            <Upload className="mr-2 h-4 w-4" /> Import Statement
                        </Button>
                        <Button
                            disabled={!selectedAccountId || autoReconcileMutation.isPending}
                            onClick={() => autoReconcileMutation.mutate(selectedAccountId)}
                        >
                            {autoReconcileMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            Auto-Reconcile
                        </Button>
                    </div>
                }
            />

            <div className="space-y-6">
                <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-lg border">
                    <label className="text-sm font-medium">Bank Account:</label>
                    <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                        <SelectTrigger className="w-[300px]">
                            <SelectValue placeholder="Select a bank account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((acc) => (
                                <SelectItem key={acc.id} value={acc.id}>
                                    {acc.bankName} - {acc.accountNumber} ({acc.currency})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedAccount && <AccountSummaryCards account={selectedAccount} />}

                {selectedAccountId ? (
                    <ReconciliationSplitView bankAccountId={selectedAccountId} />
                ) : (
                    <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
                        Please select a bank account to start reconciliation
                    </div>
                )}
            </div>

            <StatementUploadDialog
                open={isUploadOpen}
                onOpenChange={setIsUploadOpen}
                bankAccountId={selectedAccountId}
            />
        </StandardPage>
    );
}
