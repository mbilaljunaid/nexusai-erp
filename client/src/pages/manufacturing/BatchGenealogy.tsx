import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, GitBranch, ArrowRight, Package, FlaskConical, AlertCircle } from "lucide-react";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";

interface GenealogyNode {
    id: string;
    lotNumber: string;
    productId: string;
    productName: string;
    transactionType: string;
    quantity: number;
    transactionDate: string;
    parentLotId?: string;
}

export default function BatchGenealogy() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeLot, setActiveLot] = useState<string | null>(null);

    const { data: genealogyData = [], isLoading } = useQuery<GenealogyNode[]>({
        queryKey: ["/api/manufacturing/batches/genealogy", activeLot],
        enabled: !!activeLot
    });

    const columns: Column<GenealogyNode>[] = [
        {
            header: "Lot Number",
            accessorKey: "lotNumber",
            cell: (row) => <span className="font-mono font-bold">{row.lotNumber}</span>
        },
        {
            header: "Product",
            accessorKey: "productName",
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.productName}</span>
                    <span className="text-[10px] text-muted-foreground">{row.productId}</span>
                </div>
            )
        },
        {
            header: "Type",
            accessorKey: "transactionType",
            cell: (row) => (
                <Badge variant={row.transactionType === "YIELD" ? "default" : "outline"}>
                    {row.transactionType}
                </Badge>
            )
        },
        {
            header: "Quantity",
            accessorKey: "quantity",
            cell: (row) => <span className="font-mono">{row.quantity}</span>
        },
        {
            header: "Date",
            accessorKey: "transactionDate",
            cell: (row) => new Date(row.transactionDate).toLocaleString()
        }
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            setActiveLot(searchTerm.trim());
        }
    };

    return (
        <StandardPage
            title="Batch Genealogy & Traceability"
            breadcrumbs={[
                { label: "Manufacturing", href: "/manufacturing" },
                { label: "Execution" },
                { label: "Batch Traceability" }
            ]}
        >
            <div className="space-y-6">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Search className="h-5 w-5" /> Trace Lot / Batch
                        </CardTitle>
                        <CardDescription>
                            Enter a lot number to perform full multi-level backwards and forwards traceability.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                placeholder="Scan or enter Lot Number (e.g. LOT-2023-001)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-md bg-background"
                            />
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Searching..." : "Trace Genealogy"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {activeLot ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GitBranch className="h-5 w-5 text-primary" /> Visual Genealogy Tree
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="min-h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/30">
                                <div className="text-center space-y-4">
                                    <div className="flex items-center justify-center gap-8">
                                        <div className="p-4 bg-background border rounded-lg shadow-sm w-48 text-center relative">
                                            <Badge className="absolute -top-2 -right-2">Parent</Badge>
                                            <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                            <div className="text-xs font-mono mb-1">RAW-MAT-001</div>
                                            <div className="text-sm font-bold">LOT-A1</div>
                                        </div>
                                        <ArrowRight className="h-6 w-6 text-muted-foreground" />
                                        <div className="p-6 bg-primary/10 border-2 border-primary rounded-xl shadow-md w-56 text-center scale-110 relative">
                                            <Badge className="absolute -top-3 -right-3" variant="default">Active Target</Badge>
                                            <FlaskConical className="h-10 w-10 mx-auto mb-2 text-primary" />
                                            <div className="text-xs font-mono mb-1 text-primary/70">WIP-CHEM-X</div>
                                            <div className="text-lg font-bold">{activeLot}</div>
                                        </div>
                                        <ArrowRight className="h-6 w-6 text-muted-foreground" />
                                        <div className="p-4 bg-background border rounded-lg shadow-sm w-48 text-center opacity-50">
                                            <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                            <div className="text-xs font-mono mb-1 text-muted-foreground">FIN-PROD-99</div>
                                            <div className="text-sm font-bold">PENDING</div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground max-w-md">
                                        Interactive tree view showing material consumption (Backwards) and product yield (Forwards).
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Lot Metadata</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-sm">Batch Status</span>
                                        <Badge variant="default">COMPLETED</Badge>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-sm">QC Verdict</span>
                                        <Badge variant="outline" className="text-green-600 border-green-600 font-bold">PASSED</Badge>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-sm">Total Quantity</span>
                                        <span className="font-mono font-bold">1,250.00 L</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-red-100 bg-red-50/30">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                                        <AlertCircle className="h-4 w-4" /> Recall Risk Analysis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs space-y-2">
                                        <p>This lot is used in <strong>3 downstream batches</strong>.</p>
                                        <div className="p-2 bg-background border rounded font-mono">
                                            - LOT-B2 (In Progress)<br />
                                            - LOT-B3 (Planned)<br />
                                            - LOT-C1 (Shipped)
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle>Genealogy Transaction Ledger</CardTitle>
                                <CardDescription>Detailed audit trail of all movements related to this lot genealogy.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <StandardTable
                                    data={genealogyData}
                                    columns={columns}
                                    isLoading={isLoading}
                                    filterColumn="productName"
                                    filterPlaceholder="Filter ledger..."
                                />
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="py-32 text-center bg-muted/20 rounded-xl border-2 border-dashed">
                        <GitBranch className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-20" />
                        <h2 className="text-xl font-medium text-muted-foreground">Awaiting Trace Trigger</h2>
                        <p className="text-sm text-muted-foreground mt-2">Enter a lot number above to begin forensic genealogy analysis.</p>
                    </div>
                )}
            </div>
        </StandardPage>
    );
}
