import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CreditCard,
    Upload,
    CheckCircle,
    AlertCircle,
    Link as LinkIcon,
    Unlink,
    Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { InteractiveSpreadsheet, type SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

export default function CorporateCardReconciliation() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [csvData, setCsvData] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");

    // Fetch card transactions
    const { data: transactionsData } = useQuery<any>({
        queryKey: ["/api/expenses/corporate-card/transactions", selectedStatus],
        queryFn: async () => {
            const statusParam = selectedStatus !== "all" ? `?status=${selectedStatus}` : "";
            const res = await apiRequest("GET", `/api/expenses/corporate-card/transactions${statusParam}`);
            return res.json();
        }
    });

    // Import CSV mutation
    const importMutation = useMutation({
        mutationFn: async (transactions: any[]) => {
            const res = await apiRequest("POST", "/api/expenses/corporate-card/import", {
                transactions
            });
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/expenses/corporate-card/transactions"] });
            toast({
                title: "Import Complete",
                description: `${data.summary.matched} matched, ${data.summary.unmatched} unmatched (${data.summary.matchRate} match rate)`,
            });
            setCsvData("");
        },
        onError: () => {
            toast({
                title: "Import Failed",
                description: "Failed to import corporate card transactions",
                variant: "destructive",
            });
        }
    });

    const handleCsvUpload = () => {
        try {
            // Parse CSV (simple implementation - would use a proper CSV parser in production)
            const lines = csvData.trim().split("\n");
            const headers = lines[0].split(",").map(h => h.trim());

            const transactions = lines.slice(1).map(line => {
                const values = line.split(",").map(v => v.trim());
                return {
                    date: values[0],
                    merchant: values[1],
                    amount: values[2],
                    cardNumber: values[3] || "****1234",
                    category: values[4] || "UNCATEGORIZED",
                    description: values[5] || "",
                    currency: "USD"
                };
            });

            importMutation.mutate(transactions);
        } catch (error) {
            toast({
                title: "CSV Parse Error",
                description: "Invalid CSV format. Expected: Date,Merchant,Amount,CardNumber,Category,Description",
                variant: "destructive",
            });
        }
    };

    const transactions = transactionsData?.transactions || [];
    const summary = transactionsData?.summary || { pending: 0, matched: 0, reconciled: 0 };

    return (
        <StandardPage
            title="Corporate Card Reconciliation"
            description="Import and match corporate card transactions to expense reports"
        >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Transactions</p>
                                <p className="text-2xl font-bold">{summary.pending + summary.matched + summary.reconciled}</p>
                            </div>
                            <CreditCard className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Matched</p>
                                <p className="text-2xl font-bold text-blue-600">{summary.matched}</p>
                            </div>
                            <LinkIcon className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Reconciled</p>
                                <p className="text-2xl font-bold text-green-600">{summary.reconciled}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* CSV Upload Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Import Card Transactions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            CSV Data (Format: Date,Merchant,Amount,CardNumber,Category,Description)
                        </label>
                        <Textarea
                            className="h-32 font-mono text-sm"
                            placeholder="2026-02-10,Starbucks,15.50,****1234,MEALS,Coffee meeting
2026-02-11,Uber,25.00,****1234,TRANSPORTATION,Airport ride
2026-02-12,Hilton,250.00,****1234,LODGING,Conference hotel"
                            value={csvData}
                            onChange={(e) => setCsvData(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={handleCsvUpload}
                        disabled={!csvData.trim() || importMutation.isPending}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        {importMutation.isPending ? "Importing..." : "Import & Auto-Match"}
                    </Button>
                </CardContent>
            </Card >

            {/* Transactions Table */}
            < Card >
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Card Transactions</CardTitle>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="MATCHED">Matched</SelectItem>
                                <SelectItem value="RECONCILED">Reconciled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No transactions imported yet</p>
                            <p className="text-sm">Import card transactions via CSV to get started</p>
                        </div>
                    ) : (
                        <InteractiveSpreadsheet
                            data={transactions}
                            columns={[
                                {
                                    id: "transactionDate",
                                    header: "Date",
                                    width: "150px",
                                    cell: (row: any) => <div className="p-2">{new Date(row.transactionDate).toLocaleDateString()}</div>
                                },
                                {
                                    id: "merchant",
                                    header: "Merchant",
                                    width: "200px",
                                    cell: (row: any) => <div className="p-2">{row.merchant}</div>
                                },
                                {
                                    id: "amount",
                                    header: "Amount",
                                    width: "150px",
                                    cell: (row: any) => <div className="p-2">${Number(row.amount).toFixed(2)}</div>
                                },
                                {
                                    id: "cardNumber",
                                    header: "Card",
                                    width: "150px",
                                    cell: (row: any) => <div className="p-2">{row.cardNumber}</div>
                                },
                                {
                                    id: "category",
                                    header: "Category",
                                    width: "150px",
                                    cell: (row: any) => <div className="p-2">{row.category}</div>
                                },
                                {
                                    id: "status",
                                    header: "Status",
                                    width: "150px",
                                    cell: (row: any) => (
                                        <div className="p-2">
                                            <Badge variant={
                                                row.status === "RECONCILED" ? "default" :
                                                    row.status === "MATCHED" ? "secondary" : "outline"
                                            }>
                                                {row.status}
                                            </Badge>
                                        </div>
                                    )
                                },
                                {
                                    id: "matchedLineId",
                                    header: "Match",
                                    width: "150px",
                                    cell: (row: any) => (
                                        <div className="p-2">
                                            {row.matchedLineId ? (
                                                <div className="flex items-center gap-2">
                                                    <LinkIcon className="h-3 w-3 text-blue-600" />
                                                    <span className="text-xs text-blue-600">Linked</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Unmatched</span>
                                            )}
                                        </div>
                                    )
                                }
                            ]}
                            onChange={() => { }} virtualized={true} containerHeight="500px"
                        />
                    )}
                </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                    <CardTitle className="text-base">💡 How to Use</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                    <p><strong>Import:</strong> Paste CSV data from your card provider. System will auto-match transactions to existing expense lines.</p>
                    <p><strong>Auto-Matching:</strong> Uses amount, date, and category to find matches with 60%+ confidence.</p>
                    <p><strong>Manual Matching:</strong> Review unmatched transactions and link them manually if needed.</p>
                    <p><strong>Reconciliation:</strong> Once matched, transactions are marked as reconciled for audit purposes.</p>
                </CardContent>
            </Card >
        </StandardPage >
    );
}
