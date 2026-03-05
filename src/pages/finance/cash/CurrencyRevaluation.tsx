import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, TrendingDown, PlayCircle } from "lucide-react";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

export default function CurrencyRevaluation() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedAccount, setSelectedAccount] = useState<string>("");

    // Fetch bank accounts
    const { data: accounts } = useQuery<any>({
        queryKey: ["/api/finance/cash/accounts"],
        queryFn: () => fetch("/api/finance/cash/accounts").then(r => r.json())
    });

    // Fetch revaluation history
    const { data: history } = useQuery<any>({
        queryKey: ["/api/finance/cash/accounts", selectedAccount, "revalue/history"],
        queryFn: () => fetch(`/api/finance/cash/accounts/${selectedAccount}/revalue/history`).then(r => r.json()),
        enabled: !!selectedAccount
    });

    // Revaluation mutation
    const revalueMutation = useMutation({
        mutationFn: async (accountId: string) => {
            const res = await fetch(`/api/finance/cash/accounts/${accountId}/revalue`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ revaluationDate: new Date().toISOString() })
            });
            if (!res.ok) throw new Error("Revaluation failed");
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Revaluation Complete",
                description: `Gain/Loss: $${data.gainLoss?.toFixed(2) || "0.00"}`
            });
            queryClient.invalidateQueries({ queryKey: ["/api/finance/cash/accounts"] });
        },
        onError: () => {
            toast({ title: "Revaluation failed", variant: "destructive" });
        }
    });

    const handleRunRevaluation = () => {
        if (!selectedAccount) return;
        revalueMutation.mutate(selectedAccount);
    };

    const columns: SpreadsheetColumn<any>[] = [
        {
            id: "revaluationDate",
            header: "Date",
            width: "150px",
            cell: (row: any) => <span>{new Date(row.revaluationDate).toLocaleDateString()}</span>
        },
        { id: "currency", header: "Currency", width: "120px", cell: (row: any) => <span>{row.currency}</span> },
        {
            id: "oldRate",
            header: "Old Rate",
            width: "120px",
            cell: (row: any) => <span>{row.oldRate?.toFixed(4)}</span>
        },
        {
            id: "newRate",
            header: "New Rate",
            width: "120px",
            cell: (row: any) => <span>{row.newRate?.toFixed(4)}</span>
        },
        {
            id: "gainLoss",
            header: "Gain/Loss",
            width: "150px",
            cell: (row: any) => {
                const gainLoss = row.gainLoss || 0;
                return (
                    <div className="flex items-center gap-2">
                        {gainLoss >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={gainLoss >= 0 ? "text-green-600" : "text-red-600"}>
                            ${Math.abs(gainLoss).toFixed(2)}
                        </span>
                    </div>
                );
            }
        },
        {
            id: "glJournalId",
            header: "GL Journal",
            width: "150px",
            cell: (row: any) => row.glJournalId ? (
                <Badge variant="default">Created</Badge>
            ) : (
                <Badge variant="outline">Pending</Badge>
            )
        }
    ];

    return (
        <StandardPage
            title="Currency Revaluation"
            description="Revalue foreign currency bank accounts"
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Cash Management", href: "/finance/cash" },
                { label: "Revaluation" }
            ]}
            actions={
                <Button
                    onClick={handleRunRevaluation}
                    disabled={!selectedAccount || revalueMutation.isPending}
                >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Run Revaluation
                </Button>
            }
        >
            <div className="space-y-6">
                {/* Account Selector */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bank Account</CardTitle>
                        <CardDescription>Select foreign currency account to revalue</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts?.filter((acc: any) => acc.currencyCode !== 'USD')
                                    .map((acc: any) => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            {acc.accountName} - {acc.accountNumber} ({acc.currencyCode})
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {/* Current Position */}
                {selectedAccount && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Position</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">Currency</div>
                                    <div className="text-2xl font-bold">
                                        {accounts?.find((a: any) => a.id === selectedAccount)?.currencyCode}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Current Balance</div>
                                    <div className="text-2xl font-bold">
                                        ${accounts?.find((a: any) => a.id === selectedAccount)?.currentBalance?.toFixed(2)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Revaluation Required</div>
                                    <div className="text-2xl">
                                        <Badge variant="outline">Yes</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Revaluation History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Revaluation History</CardTitle>
                        <CardDescription>Historical revaluation runs for this account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <InteractiveSpreadsheet
                            data={history || []}
                            columns={columns}
                            virtualized={true}
                            containerHeight="400px"
                            onChange={() => { }}
                        />
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
