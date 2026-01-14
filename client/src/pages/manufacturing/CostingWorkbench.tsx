import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
    Calculator, Plus, TrendingUp, DollarSign, Layers
} from "lucide-react";
import type { CostElement, StandardCost } from "@shared/schema";
import { StandardPage } from "@/components/layout/StandardPage";

export default function CostingWorkbench() {
    const { toast } = useToast();
    const [isRollupOpen, setIsRollupOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState("");

    const { data: inventory = [] } = useQuery<{ id: string, itemName: string, sku: string }[]>({
        queryKey: ["/api/scm/inventory"]
    });

    // Fetch Data
    const { data: costElements = [] } = useQuery<CostElement[]>({
        queryKey: ["/api/manufacturing/cost-elements"]
    });

    const { data: standardCosts = [] } = useQuery<StandardCost[]>({
        queryKey: ["/api/manufacturing/standard-costs"]
    });

    // Mutations
    const rollupMutation = useMutation({
        mutationFn: async (productId: string) => {
            const res = await apiRequest("POST", "/api/manufacturing/standard-costs/rollup", { productId });
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Rollup Complete",
                description: `Standard cost for product calculated: $${data.totalCost}`
            });
            queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/standard-costs"] });
            setIsRollupOpen(false);
        }
    });

    // Table Columns
    const costColumns: Column<StandardCost>[] = [
        {
            header: "Product / Resource",
            accessorKey: "targetId",
            cell: (row) => {
                if (row.targetType === "RESOURCE") return <span className="font-mono text-xs">{row.targetId}</span>;
                const item = inventory.find(i => i.id === row.targetId);
                return (
                    <div>
                        <div className="font-medium text-sm">{item ? item.itemName : "Unknown Item"}</div>
                        <div className="text-xs text-muted-foreground font-mono">{item ? item.sku : row.targetId}</div>
                    </div>
                );
            }
        },
        {
            header: "Unit Cost",
            accessorKey: "unitCost",
            cell: (row) => `$${Number(row.unitCost).toFixed(2)}`
        },
        {
            header: "Effective Date",
            accessorKey: "effectiveDate",
            cell: (row) => new Date(row.effectiveDate!).toLocaleDateString()
        },
        {
            header: "Status",
            accessorKey: "isActive",
            cell: (row) => row.isActive ? "Active" : "Historical"
        }
    ];

    const elementColumns: Column<CostElement>[] = [
        { header: "Code", accessorKey: "code" },
        { header: "Name", accessorKey: "name" },
        { header: "Type", accessorKey: "type" },
        { header: "GL Account", accessorKey: "glAccountId" }
    ];

    return (
        <StandardPage
            title="Costing Workbench"
            breadcrumbs={[
                { label: "Manufacturing", href: "/manufacturing" },
                { label: "Financials" },
                { label: "Costing" }
            ]}
            actions={
                <div className="flex gap-2">
                    <Sheet open={isRollupOpen} onOpenChange={setIsRollupOpen}>
                        <SheetTrigger asChild>
                            <Button>
                                <Calculator className="mr-2 h-4 w-4" />
                                Cost Rollup
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Standard Cost Rollup</SheetTitle>
                            </SheetHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Product / Assembly</Label>
                                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {inventory.map(item => (
                                                <SelectItem key={item.id} value={item.id}>{item.itemName} ({item.sku})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Calculates recursive BOM & Routing costs plus overheads.
                                    </p>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => rollupMutation.mutate(selectedProduct)}
                                    disabled={rollupMutation.isPending || !selectedProduct}
                                >
                                    {rollupMutation.isPending ? "Calculating..." : "Run Rollup"}
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        New Cost Element
                    </Button>
                </div>
            }
        >

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Standard Costs</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{standardCosts.length}</div>
                        <p className="text-xs text-muted-foreground">Active cost records in system</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cost Elements</CardTitle>
                        <Layers className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{costElements.length}</div>
                        <p className="text-xs text-muted-foreground">Defined cost buckets</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total WIP Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$124,500</div>
                        <p className="text-xs text-muted-foreground">+5.2% from last period</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Standard Cost Register</CardTitle>
                    <CardDescription>Current validated costs for all manufactured items.</CardDescription>
                </CardHeader>
                <CardContent>
                    <StandardTable
                        columns={costColumns}
                        data={standardCosts}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Cost Elements</CardTitle>
                    <CardDescription>Definitions for material, labor, and overhead buckets.</CardDescription>
                </CardHeader>
                <CardContent>
                    <StandardTable
                        columns={elementColumns}
                        data={costElements}
                    />
                </CardContent>
            </Card>
        </StandardPage>
    );
}
