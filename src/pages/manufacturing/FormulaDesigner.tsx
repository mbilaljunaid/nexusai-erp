import React, { useState } from 'react';
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Plus, Save, X, FlaskConical, Scale, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";

interface InventoryItem {
    id: string;
    itemName: string;
    sku: string;
}

interface FormulaIngredient {
    id?: string;
    ingredientId: string;
    percentage: number;
    lossFactor: number;
    uom: string;
}

interface FormulaHeader {
    id: string;
    formulaCode: string;
    name: string;
    productId: string;
    displayName?: string;
    version: string;
    status: "active" | "draft" | "obsolete";
    totalYield: number;
}

export default function FormulaDesigner() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Form State
    const [formulaCode, setFormulaCode] = useState("");
    const [formulaName, setFormulaName] = useState("");
    const [targetProduct, setTargetProduct] = useState("");
    const [version, setVersion] = useState("1.0");
    const [ingredients, setIngredients] = useState<FormulaIngredient[]>([]);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);

    const { data, isLoading: formulasLoading } = useQuery<{ items: FormulaHeader[], total: number }>({
        queryKey: ["/api/manufacturing/formulas", page, pageSize],
        queryFn: async () => {
            const offset = (page - 1) * pageSize;
            const res = await fetch(`/api/manufacturing/formulas?limit=${pageSize}&offset=${offset}`);
            return res.json();
        }
    });

    const formulas = data?.items || [];
    const totalItems = data?.total || 0;

    const { data: inventory = [] } = useQuery<InventoryItem[]>({
        queryKey: ["/api/scm/inventory"],
        queryFn: async () => {
            const res = await fetch("/api/scm/inventory");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/manufacturing/formulas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to save Formula");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/formulas"] });
            setIsSheetOpen(false);
            resetForm();
            toast({ title: "Success", description: "Process Formula saved successfully" });
        }
    });

    const resetForm = () => {
        setIngredients([]);
        setFormulaCode("");
        setFormulaName("");
        setTargetProduct("");
        setVersion("1.0");
    };

    const addIngredient = () => {
        setIngredients([...ingredients, { ingredientId: "", percentage: 0, lossFactor: 0, uom: "KG" }]);
    };

    const removeIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const updateIngredient = (index: number, field: keyof FormulaIngredient, value: any) => {
        const updated = [...ingredients];
        updated[index] = { ...updated[index], [field]: value };
        setIngredients(updated);
    };

    const totalPercentage = ingredients.reduce((sum, ing) => sum + ing.percentage, 0);

    const handleSave = () => {
        if (!formulaCode || !formulaName || !targetProduct || ingredients.length === 0) {
            toast({ title: "Validation Error", description: "Please fill all required fields", variant: "destructive" });
            return;
        }

        if (Math.abs(totalPercentage - 100) > 0.01) {
            toast({ title: "Validation Error", description: `Total percentage must equal 100% (Current: ${totalPercentage.toFixed(2)}%)`, variant: "destructive" });
            return;
        }

        const payload = {
            header: {
                formulaCode,
                name: formulaName,
                productId: targetProduct,
                version,
                status: "active",
                totalYield: 100 // Default yield percentage
            },
            ingredients: ingredients.map(i => ({
                ingredientId: i.ingredientId,
                percentage: i.percentage,
                lossFactor: i.lossFactor,
                uom: i.uom
            }))
        };
        createMutation.mutate(payload);
    };

    const formulasWithNames = formulas.map(f => {
        const product = inventory.find(i => i.id === f.productId);
        return { ...f, displayName: product ? product.itemName : f.productId };
    });

    const columns: Column<FormulaHeader & { displayName: string }>[] = [
        {
            header: "Formula ID",
            accessorKey: "formulaCode",
            cell: (row: any) => <span className="font-mono font-bold text-indigo-700">{row.formulaCode}</span>
        },
        {
            header: "Formula Name",
            accessorKey: "name",
        },
        {
            header: "Product",
            accessorKey: "displayName",
        },
        {
            header: "Version",
            accessorKey: "version",
            cell: (row: any) => <Badge variant="outline">v{row.version}</Badge>
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row: any) => (
                <Badge variant={row.status === "active" ? "default" : "secondary"}>
                    {row.status.toUpperCase()}
                </Badge>
            )
        }
    ];

    return (
        <StandardPage
            title="Formula & Recipe Designer"
            breadcrumbs={[
                { label: "Manufacturing", href: "/manufacturing" },
                { label: "Process Engineering" },
                { label: "Formulas" }
            ]}
            actions={
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button onClick={() => { resetForm(); setIsSheetOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="mr-2 h-4 w-4" /> New Formula
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-2xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                                <FlaskConical className="h-5 w-5 text-indigo-500" />
                                Process Formula Specification
                            </SheetTitle>
                            <SheetDescription>
                                Define material percentages and process loss factors for batch manufacturing.
                            </SheetDescription>
                        </SheetHeader>

                        <div className="space-y-6 mt-6 pb-24">
                            <Card className="border-indigo-100 bg-indigo-50/30">
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Formula Code</Label>
                                            <Input value={formulaCode} onChange={e => setFormulaCode(e.target.value)} placeholder="FORM-CHEM-001" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Formula Name</Label>
                                            <Input value={formulaName} onChange={e => setFormulaName(e.target.value)} placeholder="Premium Adhesive Base" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Output Product</Label>
                                            <Select value={targetProduct} onValueChange={setTargetProduct}>
                                                <SelectTrigger><SelectValue placeholder="Select Finished Good" /></SelectTrigger>
                                                <SelectContent>
                                                    {inventory.map(item => (
                                                        <SelectItem key={item.id} value={item.id}>{item.itemName} ({item.sku})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Version</Label>
                                            <Input value={version} onChange={e => setVersion(e.target.value)} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <Scale className="h-4 w-4 text-muted-foreground" />
                                    Material Balance (Ingredients)
                                </h3>
                                <div className={`text-xs font-bold px-2 py-1 rounded ${Math.abs(totalPercentage - 100) < 0.01 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    Total: {totalPercentage.toFixed(2)}%
                                </div>
                            </div>

                            <Card className="shadow-sm">
                                <CardContent className="p-0">
                                    <div className="divide-y">
                                        {ingredients.map((ing, idx) => (
                                            <div key={idx} className="p-4 flex gap-4 items-end group relative">
                                                <div className="flex-1 space-y-2">
                                                    <Label className="text-[10px] uppercase text-muted-foreground">Ingredient</Label>
                                                    <Select value={ing.ingredientId} onValueChange={val => updateIngredient(idx, "ingredientId", val)}>
                                                        <SelectTrigger className="h-9"><SelectValue placeholder="Search Inventory" /></SelectTrigger>
                                                        <SelectContent>
                                                            {inventory.map(item => (
                                                                <SelectItem key={item.id} value={item.id}>{item.itemName}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="w-24 space-y-2">
                                                    <Label className="text-[10px] uppercase text-muted-foreground">Weight %</Label>
                                                    <div className="relative">
                                                        <Input type="number" className="h-9 pr-7" value={ing.percentage} onChange={e => updateIngredient(idx, "percentage", parseFloat(e.target.value) || 0)} />
                                                        <span className="absolute right-2 top-2 text-xs opacity-40">%</span>
                                                    </div>
                                                </div>
                                                <div className="w-24 space-y-2">
                                                    <Label className="text-[10px] uppercase text-muted-foreground">Loss %</Label>
                                                    <div className="relative">
                                                        <Input type="number" className="h-9 pr-7" value={ing.lossFactor} onChange={e => updateIngredient(idx, "lossFactor", parseFloat(e.target.value) || 0)} />
                                                        <span className="absolute right-2 top-2 text-xs opacity-40">%</span>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-red-500" onClick={() => removeIngredient(idx)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    {ingredients.length === 0 && (
                                        <div className="py-12 text-center">
                                            <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground opacity-10 mb-2" />
                                            <p className="text-sm text-muted-foreground">No ingredients defined in recipe.</p>
                                        </div>
                                    )}
                                    <div className="p-4 bg-muted/30 border-t">
                                        <Button variant="outline" size="sm" onClick={addIngredient} className="w-full dashed border-2">
                                            <Plus className="h-4 w-4 mr-2" /> Add Ingredient
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t flex justify-end gap-3 z-50">
                                <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Close Designer</Button>
                                <Button onClick={handleSave} disabled={createMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                                    <Save className="mr-2 h-4 w-4" /> {createMutation.isPending ? "Validating..." : "Finalize Formula"}
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            }
        >
            <div className="bg-white rounded-lg border shadow-sm">
                <StandardTable
                    data={formulasWithNames}
                    columns={columns}
                    isLoading={formulasLoading}
                    keyExtractor={(item) => item.id}
                    filterColumn="displayName"
                    filterPlaceholder="Search by output product..."
                    page={page}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={setPage}
                />
            </div>
        </StandardPage>
    );
}
