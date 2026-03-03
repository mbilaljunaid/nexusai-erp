import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploadZone } from "@/components/shared/FileUploadZone";
import { PDFExportButton } from "@/components/shared/PDFExportButton";
import { useToast } from "@/hooks/use-toast";
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    Search,
    PlayCircle,
    Download,
    Filter
} from "lucide-react";
import { StandardPage } from '@/components/layout/StandardPage';

interface BankAccount {
    id: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
    currency: string;
    balance: number;
}

interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: "debit" | "credit";
    status: "matched" | "unmatched" | "discrepancy";
    matchedWith?: string;
}

interface ReconciliationSummary {
    totalBankTransactions: number;
    totalGLTransactions: number;
    matched: number;
    unmatched: number;
    discrepancies: number;
}

export default function BankReconciliationWorkbench() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedAccountId, setSelectedAccountId] = useState<string>("");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "matched" | "unmatched" | "discrepancy">("all");

    // Fetch bank accounts
    const { data: accounts = [] } = useQuery<BankAccount[]>({
        queryKey: ["/api/finance/cash/accounts"],
        queryFn: async () => {
            const res = await fetch("/api/finance/cash/accounts");
            if (!res.ok) throw new Error("Failed to fetch accounts");
            return res.json();
        }
    });

    // Fetch unreconciled transactions for selected account
    const { data: unreconciledItems = [], isLoading: itemsLoading } = useQuery<Transaction[]>({
        queryKey: ["/api/finance/cash/accounts", selectedAccountId, "unreconciled"],
        queryFn: async () => {
            if (!selectedAccountId) return [];
            const res = await fetch(`/api/finance/cash/accounts/${selectedAccountId}/unreconciled`);
            if (!res.ok) throw new Error("Failed to fetch unreconciled items");
            return res.json();
        },
        enabled: !!selectedAccountId
    });

    // Fetch reconciliation summary
    const { data: summary } = useQuery<ReconciliationSummary>({
        queryKey: ["/api/finance/cash/accounts", selectedAccountId, "reconciliation-summary"],
        queryFn: async () => {
            if (!selectedAccountId) return null;
            const res = await fetch(`/api/finance/cash/accounts/${selectedAccountId}/reconcile-report`);
            if (!res.ok) throw new Error("Failed to fetch summary");
            return res.json();
        },
        enabled: !!selectedAccountId
    });

    // Import statement mutation
    const importMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("accountId", selectedAccountId);

            const res = await fetch("/api/finance/cash/statements/import", {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Import failed");
            }

            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Statement Imported",
                description: `Successfully imported ${data.transactionsCount} transactions`
            });
            setUploadStatus("success");
            queryClient.invalidateQueries({ queryKey: ["/api/finance/cash/accounts", selectedAccountId] });
        },
        onError: (error: Error) => {
            toast({
                title: "Import Failed",
                description: error.message,
                variant: "destructive"
            });
            setUploadStatus("error");
        }
    });

    // Auto reconciliation mutation
    const autoReconcileMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/finance/cash/accounts/${selectedAccountId}/reconcile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            if (!res.ok) throw new Error("Auto reconciliation failed");
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Auto Reconciliation Complete",
                description: `Matched ${data.matchedCount} transactions`
            });
            queryClient.invalidateQueries({ queryKey: ["/api/finance/cash/accounts", selectedAccountId] });
        },
        onError: (error: Error) => {
            toast({
                title: "Reconciliation Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    // Manual match mutation
    const manualMatchMutation = useMutation({
        mutationFn: async ({ bankTxnId, glTxnId }: { bankTxnId: string; glTxnId: string }) => {
            const res = await fetch(`/api/finance/cash/accounts/${selectedAccountId}/reconcile-manual`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bankTxnId, glTxnId })
            });

            if (!res.ok) throw new Error("Manual match failed");
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Transaction Matched",
                description: "Manual match successful"
            });
            queryClient.invalidateQueries({ queryKey: ["/api/finance/cash/accounts", selectedAccountId] });
        }
    });

    const handleFileSelect = (file: File) => {
        setUploadedFile(file);
        setUploadStatus("idle");
    };

    const handleFileRemove = () => {
        setUploadedFile(null);
        setUploadStatus("idle");
    };

    const handleImport = () => {
        if (!uploadedFile || !selectedAccountId) return;
        setUploadStatus("uploading");
        importMutation.mutate(uploadedFile);
    };

    const handleAutoReconcile = () => {
        if (!selectedAccountId) {
            toast({
                title: "No Account Selected",
                description: "Please select a bank account first",
                variant: "destructive"
            });
            return;
        }
        autoReconcileMutation.mutate();
    };

    const formatCurrency = (amount: number, currency: string = "USD") => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "matched":
                return <Badge className="bg-green-600"><CheckCircle2 className="mr-1 h-3 w-3" />Matched</Badge>;
            case "unmatched":
                return <Badge variant="secondary"><AlertCircle className="mr-1 h-3 w-3" />Unmatched</Badge>;
            case "discrepancy":
                return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Discrepancy</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredTransactions = unreconciledItems.filter((txn) => {
        const matchesSearch = txn.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || txn.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <StandardPage
            title="Bank Reconciliation"
            description="Import bank statements and reconcile transactions"
        >
            <div className="space-y-6">
                {/* Account Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Select Bank Account</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a bank account..." />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((account) => (
                                    <SelectItem key={account.id} value={account.id}>
                                        {account.accountName} - {account.bankName} ({account.accountNumber})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {selectedAccountId && (
                    <>
                        {/* Reconciliation Summary */}
                        {summary && (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground">Bank Transactions</p>
                                        <p className="text-2xl font-bold">{summary.totalBankTransactions}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground">GL Transactions</p>
                                        <p className="text-2xl font-bold">{summary.totalGLTransactions}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground">Matched</p>
                                        <p className="text-2xl font-bold text-green-600">{summary.matched}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground">Unmatched</p>
                                        <p className="text-2xl font-bold text-orange-600">{summary.unmatched}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground">Discrepancies</p>
                                        <p className="text-2xl font-bold text-red-600">{summary.discrepancies}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Main Tabs */}
                        <Tabs defaultValue="import" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="import">Import Statement</TabsTrigger>
                                <TabsTrigger value="reconcile">Reconcile</TabsTrigger>
                                <TabsTrigger value="report">Report</TabsTrigger>
                            </TabsList>

                            {/* Import Tab */}
                            <TabsContent value="import" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Import Bank Statement</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Upload bank statement in CSV, OFX, or BAI2 format
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FileUploadZone
                                            onFileSelect={handleFileSelect}
                                            onFileRemove={handleFileRemove}
                                            currentFile={uploadedFile}
                                            uploadStatus={uploadStatus}
                                            acceptedFormats={[".csv", ".ofx", ".bai2"]}
                                            maxSizeMB={5}
                                        />
                                        {uploadedFile && uploadStatus !== "success" && (
                                            <Button
                                                onClick={handleImport}
                                                disabled={importMutation.isPending || uploadStatus === "uploading"}
                                                className="w-full"
                                            >
                                                {importMutation.isPending ? "Importing..." : "Import Statement"}
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Reconcile Tab */}
                            <TabsContent value="reconcile" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Reconciliation Workbench</CardTitle>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Match bank transactions with GL entries
                                                </p>
                                            </div>
                                            <Button
                                                onClick={handleAutoReconcile}
                                                disabled={autoReconcileMutation.isPending}
                                            >
                                                <PlayCircle className="mr-2 h-4 w-4" />
                                                {autoReconcileMutation.isPending ? "Running..." : "Auto Reconcile"}
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Filters */}
                                        <div className="flex gap-3">
                                            <div className="flex-1 relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search transactions..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10"
                                                />
                                            </div>
                                            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                                                <SelectTrigger className="w-48">
                                                    <Filter className="mr-2 h-4 w-4" />
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Status</SelectItem>
                                                    <SelectItem value="matched">Matched</SelectItem>
                                                    <SelectItem value="unmatched">Unmatched</SelectItem>
                                                    <SelectItem value="discrepancy">Discrepancy</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Transactions List */}
                                        <div className="border rounded-lg">
                                            {itemsLoading ? (
                                                <div className="p-8 text-center text-muted-foreground">
                                                    Loading transactions...
                                                </div>
                                            ) : filteredTransactions.length === 0 ? (
                                                <div className="p-8 text-center text-muted-foreground">
                                                    {searchTerm || filterStatus !== "all"
                                                        ? "No transactions match your filters"
                                                        : "No unreconciled transactions"
                                                    }
                                                </div>
                                            ) : (
                                                <div className="divide-y">
                                                    {filteredTransactions.map((txn) => (
                                                        <div
                                                            key={txn.id}
                                                            className="p-4 hover:bg-muted/50 transition-colors"
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <p className="font-medium">{txn.description}</p>
                                                                        {getStatusBadge(txn.status)}
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {formatDate(txn.date)} • {txn.type === "debit" ? "Debit" : "Credit"}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className={`text-lg font-semibold ${txn.type === "credit" ? "text-green-600" : "text-red-600"
                                                                        }`}>
                                                                        {txn.type === "credit" ? "+" : "-"}
                                                                        {formatCurrency(Math.abs(txn.amount))}
                                                                    </p>
                                                                    {txn.status === "unmatched" && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="mt-2"
                                                                        >
                                                                            Match Manually
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Report Tab */}
                            <TabsContent value="report" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Reconciliation Report</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Download detailed reconciliation report
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-medium">Bank Reconciliation Report</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Includes all matched, unmatched, and discrepancy transactions
                                                </p>
                                            </div>
                                            <PDFExportButton
                                                endpoint={`/api/finance/cash/accounts/${selectedAccountId}/reconcile-report/pdf`}
                                                filename={`reconciliation_${selectedAccountId}_${Date.now()}.pdf`}
                                                label="Download PDF"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </div>
        </StandardPage>
    );
}
