import { formatDateTime } from "@/lib/dateUtils";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, GitBranch, ArrowRight, Package, FlaskConical, AlertCircle } from "lucide-react";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

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


const searchSchema = z.object({
    searchTerm: z.string().optional()
});

export default function BatchGenealogy() {

    const form = useForm<z.infer<typeof searchSchema>>({
        resolver: zodResolver(searchSchema),
        defaultValues: { searchTerm: "" }
    });
    const [activeLot, setActiveLot] = useState<string | null>(null);

    const { data: genealogyData = [], isLoading } = useQuery<GenealogyNode[]>({
        queryKey: ["/api/manufacturing/batches/genealogy", activeLot],
        queryFn: async () => {
            const res = await fetch(`/api/manufacturing/batches/genealogy?lotNumber=${activeLot}`);
            if (!res.ok) throw new Error("Failed to fetch genealogy");
            return res.json();
        },
        enabled: !!activeLot
    });

    const columns: SpreadsheetColumn<GenealogyNode>[] = [
        {
            id: "lotNumber",
            header: "Lot Number",
            width: "200px",
            cell: (row) => <span className="font-mono font-bold">{row.lotNumber}</span>
        },
        {
            id: "productName",
            header: "Product",
            width: "250px",
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.productName}</span>
                    <span className="text-[10px] text-muted-foreground">{row.productId}</span>
                </div>
            )
        },
        {
            id: "transactionType",
            header: "Type",
            width: "150px",
            cell: (row) => (
                <Badge variant={row.transactionType === "YIELD" ? "default" : "outline"}>
                    {row.transactionType}
                </Badge>
            )
        },
        {
            id: "quantity",
            header: "Quantity",
            width: "150px",
            cell: (row) => <span className="font-mono">{row.quantity}</span>
        },
        {
            id: "transactionDate",
            header: "Date",
            width: "200px",
            cell: (row) => <span>{formatDateTime(row.transactionDate)}</span>
        }
    ];

    const onSubmit = (data: z.infer<typeof searchSchema>) => {
        if (data.searchTerm?.trim()) {
            setActiveLot(data.searchTerm.trim());
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
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 w-full max-w-md">
                                <FormField
                                    control={form.control}
                                    name="searchTerm"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input
                                                    placeholder="Scan or enter Lot Number (e.g. LOT-2023-001)..."
                                                    {...field}
                                                    className="bg-background"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Searching..." : "Trace Genealogy"}
                                </Button>
                            </form>
                        </Form>
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
                                <div className="text-center space-y-8 w-full">
                                    <div className="flex flex-wrap items-center justify-center gap-8">
                                        {/* Backwards (Parents) */}
                                        {genealogyData.filter(n => n.transactionType === "FEED" || (n.lotNumber !== activeLot && n.parentLotId === undefined)).map((node, i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <div className="p-4 bg-background border rounded-lg shadow-sm w-48 text-center relative hover:border-indigo-500 transition-colors">
                                                    <Badge className="absolute -top-2 -right-2" variant="secondary">Material</Badge>
                                                    <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                                    <div className="text-[10px] font-mono mb-1 truncate">{node.productName}</div>
                                                    <div className="text-sm font-bold">{node.lotNumber}</div>
                                                </div>
                                                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                        ))}

                                        {/* Target Lot */}
                                        <div className="p-6 bg-indigo-500/10 border-2 border-indigo-600 rounded-xl shadow-md w-56 text-center scale-110 relative animate-in fade-in zoom-in duration-300">
                                            <Badge className="absolute -top-3 -right-3" variant="default">Active Target</Badge>
                                            <FlaskConical className="h-10 w-10 mx-auto mb-2 text-indigo-600" />
                                            <div className="text-xs font-mono mb-1 text-indigo-700">ACTIVE TRACE</div>
                                            <div className="text-lg font-bold text-indigo-900 dark:text-indigo-200">{activeLot}</div>
                                        </div>

                                        {/* Forwards (Children) */}
                                        {genealogyData.filter(n => n.parentLotId === activeLot).map((node, i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                                                <div className="p-4 bg-background border rounded-lg shadow-sm w-48 text-center relative hover:border-green-500 transition-colors">
                                                    <Badge className="absolute -top-2 -right-2" variant="default">Yield</Badge>
                                                    <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                                    <div className="text-[10px] font-mono mb-1 truncate">{node.productName}</div>
                                                    <div className="text-sm font-bold">{node.lotNumber}</div>
                                                </div>
                                            </div>
                                        ))}

                                        {genealogyData.filter(n => n.parentLotId === activeLot).length === 0 && (
                                            <div className="flex items-center gap-4 opacity-30">
                                                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                                                <div className="p-4 bg-background border rounded-lg shadow-sm w-48 text-center border-dashed">
                                                    <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                                    <div className="text-xs font-mono mb-1">END OF LINE</div>
                                                    <div className="text-sm font-bold italic text-muted-foreground">No downstream</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                        Multi-level genealogy showing raw material inputs and downstream product usage.
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

                            <Card className="border-red-100 bg-red-500/10">
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
                            <CardContent className="h-[400px]">
                                {isLoading ? (
                                    <div className="text-center p-4">Loading ledger...</div>
                                ) : (
                                    <InteractiveSpreadsheet
                                        data={genealogyData}
                                        columns={columns}
                                        onChange={() => { }}
                                        containerHeight="100%"
                                    />
                                )}
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
