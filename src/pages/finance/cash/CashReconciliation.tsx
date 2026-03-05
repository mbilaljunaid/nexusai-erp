import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
    Upload, PlayCircle, FileText, Settings, CheckCircle2,
    XCircle, AlertCircle, Download, RefreshCw
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CashReconciliation() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedAccount, setSelectedAccount] = useState<string>("");
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [importFormat, setImportFormat] = useState("CSV");
    const [autoReconcileProgress, setAutoReconcileProgress] = useState(0);

    // Fetch bank accounts
    const { data: accounts } = useQuery<any>({
        queryKey: ["/api/finance/cash/accounts"],
        queryFn: () => fetch("/api/finance/cash/accounts").then(r => r.json())
    });

    // Fetch reconciliation summary
    const { data: summary } = useQuery<any>({
        queryKey: ["/api/finance/cash/reconcile/summary", selectedAccount],
        queryFn: () => fetch(`/api/finance/cash/reconcile/summary?accountId=${selectedAccount}`).then(r => r.json()),
        enabled: !!selectedAccount
    });

    // Fetch unreconciled statement lines
    const { data: statementLines } = useQuery<any>({
        queryKey: ["/api/finance/cash/accounts", selectedAccount, "statement-lines"],
        queryFn: () => fetch(`/api/finance/cash/accounts/${selectedAccount}/statement-lines`).then(r => r.json()),
        enabled: !!selectedAccount
    });

    // Fetch unreconciled transactions
    const { data: transactions } = useQuery<any>({
        queryKey: ["/api/finance/cash/accounts", selectedAccount, "transactions"],
        queryFn: () => fetch(`/api/finance/cash/accounts/${selectedAccount}/transactions`).then(r => r.json()),
        enabled: !!selectedAccount
    });

    // Import statement mutation
    const importMutation = useMutation({
        mutationFn: async ({ file, accountId, format }: { file: File; accountId: string; format: string }) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("bankAccountId", accountId);
            formData.append("format", format);

            const res = await fetch("/api/finance/cash/statements/upload", {
                method: "POST",
                body: formData
            });
            if (!res.ok) throw new Error("Import failed");
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Statement Imported",
                description: `${data.linesImported || 0} lines imported successfully`
            });
            setShowImportDialog(false);
            setUploadedFile(null);
            queryClient.invalidateQueries({ queryKey: ["/api/finance/cash/accounts"] });
        },
        onError: () => {
            toast({ title: "Import failed", variant: "destructive" });
        }
    });

    // Auto reconciliation mutation
    const autoReconcileMutation = useMutation({
        mutationFn: async (accountId: string) => {
            const res = await fetch(`/api/finance/cash/accounts/${accountId}/reconcile`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Auto reconciliation failed");
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Auto Reconciliation Complete",
                description: `${data.matchedCount || 0} items matched automatically`
            });
            queryClient.invalidateQueries({ queryKey: ["/api/finance/cash/reconcile/summary"] });
            queryClient.invalidateQueries({ queryKey: ["/api/finance/cash/accounts"] });
        }
    });

    // Manual reconciliation mutation
    const manualReconcileMutation = useMutation({
        mutationFn: async ({ statementLineId, transactionId }: { statementLineId: string; transactionId: string }) => {
            const res = await fetch("/api/finance/cash/reconcile/manual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ statementLineId, transactionId })
            });
            if (!res.ok) throw new Error("Manual match failed");
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Items matched successfully" });
            queryClient.invalidateQueries({ queryKey: ["/api/finance/cash/accounts"] });
        }
    });

    const handleImportStatement = () => {
        if (!uploadedFile || !selectedAccount) {
            toast({ title: "Please select account and file", variant: "destructive" });
            return;
        }
        importMutation.mutate({ file: uploadedFile, accountId: selectedAccount, format: importFormat });
    };

    const handleAutoReconcile = () => {
        if (!selectedAccount) return;
        autoReconcileMutation.mutate(selectedAccount);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedFile(e.target.files[0]);
        }
    };

    const downloadPDFReport = () => {
        if (!selectedAccount) return;
        window.open(`/api/finance/cash/accounts/${selectedAccount}/reconcile-report/pdf`, '_blank');
    };

    return (
        <StandardPage
            title="Bank Reconciliation"
            description="Reconcile bank statements with cash transactions"
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Cash Management", href: "/finance/cash" },
                { label: "Reconciliation" }
            ]}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Statement
                    </Button>
                    <Button onClick={downloadPDFReport} disabled={!selectedAccount}>
                        <Download className="mr-2 h-4 w-4" />
                        PDF Report
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Account Selector */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bank Account</CardTitle>
                        <CardDescription>Select account to reconcile</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select bank account" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts?.map((acc: any) => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        {acc.accountName} - {acc.accountNumber} ({acc.currencyCode})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {selectedAccount && (
                    <>
                        {/* Summary Dashboard */}
                        <div className="grid grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Reconciled</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <div className="text-2xl font-bold">{summary?.reconciled || 0}</div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Unreconciled</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <XCircle className="h-4 w-4 text-orange-500" />
                                        <div className="text-2xl font-bold">{summary?.unreconciled || 0}</div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Variance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        ${summary?.variance?.toFixed(2) || "0.00"}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Actions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        onClick={handleAutoReconcile}
                                        disabled={autoReconcileMutation.isPending}
                                        size="sm"
                                        className="w-full"
                                    >
                                        {autoReconcileMutation.isPending ? (
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <PlayCircle className="mr-2 h-4 w-4" />
                                        )}
                                        Auto Reconcile
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Reconciliation Workbench */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Reconciliation Workbench</CardTitle>
                                <CardDescription>Match statement lines with transactions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="unreconciled">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="unreconciled">Unreconciled Items</TabsTrigger>
                                        <TabsTrigger value="rules">Reconciliation Rules</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="unreconciled" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Statement Lines */}
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-sm">Statement Lines ({statementLines?.length || 0})</h4>
                                                <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                                                    {statementLines?.map((line: any) => (
                                                        <div key={line.id} className="p-3 hover:bg-muted/50 cursor-pointer">
                                                            <div className="flex justify-between items-start">
                                                                <div className="space-y-1">
                                                                    <div className="font-medium">{line.description}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {new Date(line.statementDate).toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                                <Badge variant={line.amount > 0 ? "default" : "secondary"}>
                                                                    ${line.amount?.toFixed(2)}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!statementLines || statementLines.length === 0) && (
                                                        <div className="p-8 text-center text-muted-foreground">
                                                            No unreconciled statement lines
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Transactions */}
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-sm">Transactions ({transactions?.length || 0})</h4>
                                                <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                                                    {transactions?.map((txn: any) => (
                                                        <div key={txn.id} className="p-3 hover:bg-muted/50 cursor-pointer">
                                                            <div className="flex justify-between items-start">
                                                                <div className="space-y-1">
                                                                    <div className="font-medium">{txn.description}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {new Date(txn.transactionDate).toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                                <Badge variant={txn.amount > 0 ? "default" : "secondary"}>
                                                                    ${txn.amount?.toFixed(2)}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!transactions || transactions.length === 0) && (
                                                        <div className="p-8 text-center text-muted-foreground">
                                                            No unreconciled transactions
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="rules">
                                        <Alert>
                                            <Settings className="h-4 w-4" />
                                            <AlertDescription>
                                                Reconciliation rules configuration coming soon. Define matching criteria for automatic reconciliation.
                                            </AlertDescription>
                                        </Alert>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Import Dialog */}
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Bank Statement</DialogTitle>
                        <DialogDescription>
                            Upload a bank statement file to reconcile transactions
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Bank Account</Label>
                            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts?.map((acc: any) => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            {acc.accountName} - {acc.accountNumber}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>File Format</Label>
                            <Select value={importFormat} onValueChange={setImportFormat}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CSV">CSV</SelectItem>
                                    <SelectItem value="OFX">OFX</SelectItem>
                                    <SelectItem value="BAI2">BAI2</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Statement File</Label>
                            <Input
                                type="file"
                                accept=".csv,.ofx,.bai,.bai2"
                                onChange={handleFileChange}
                            />
                            {uploadedFile && (
                                <div className="text-sm text-muted-foreground">
                                    Selected: {uploadedFile.name}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleImportStatement}
                            disabled={!uploadedFile || !selectedAccount || importMutation.isPending}
                        >
                            {importMutation.isPending ? "Importing..." : "Import"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
