import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2, Beaker, Factory } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface YieldOutput {
    id?: string;
    itemId: string;
    yieldType: "PRIMARY" | "CO_PRODUCT" | "BY_PRODUCT";
    allocationPercentage: number;
}

export default function FormulaYieldEditor() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedFormulaId, setSelectedFormulaId] = useState("");

    const { data: formulas, isLoading: formulasLoading } = useQuery({
        queryKey: ["/api/manufacturing/formulas-list"],
        queryFn: async () => {
            // Stub for dropdown
            return [
                { id: "FORM-CHEM-001", name: "Premium Adhesive Base", primaryProduct: "ITEM-1001" },
                { id: "FORM-ORG-002", name: "Organic Fertilizer Mix", primaryProduct: "ITEM-2005" }
            ];
        }
    });

    const { data: inventory = [] } = useQuery({
        queryKey: ["/api/inventory/items-list"],
        queryFn: async () => {
            // Stub
            return [
                { id: "ITEM-1001", itemName: "Adhesive Main", sku: "ADH-01" },
                { id: "ITEM-1002", itemName: "Adhesive Sludge (By-Product)", sku: "ADH-SLG" },
                { id: "ITEM-2005", itemName: "Fertilizer Grade A", sku: "FERT-A" },
                { id: "ITEM-2006", itemName: "Fertilizer Grade B (Co-Product)", sku: "FERT-B" },
            ];
        }
    });

    const [outputs, setOutputs] = useState<YieldOutput[]>([
        { itemId: "ITEM-1001", yieldType: "PRIMARY", allocationPercentage: 85 },
        { itemId: "ITEM-1002", yieldType: "BY_PRODUCT", allocationPercentage: 15 },
    ]);

    const handleUpdateOutput = (index: number, field: keyof YieldOutput, value: any) => {
        const newOutputs = [...outputs];
        newOutputs[index] = { ...newOutputs[index], [field]: value };
        setOutputs(newOutputs);
    };

    const addOutput = () => {
        setOutputs([...outputs, { itemId: "", yieldType: "CO_PRODUCT", allocationPercentage: 0 }]);
    };

    const removeOutput = (index: number) => {
        setOutputs(outputs.filter((_, i) => i !== index));
    };

    const totalAllocation = outputs.reduce((sum, o) => sum + o.allocationPercentage, 0);

    const saveMutation = useMutation({
        mutationFn: async () => {
            if (totalAllocation !== 100) throw new Error("Total Yield Allocation must equal 100%");
            return new Promise(resolve => setTimeout(resolve, 800));
        },
        onSuccess: () => {
            toast({ title: "Yield Rules Updated", description: "Co-products and by-products have been successfully attached to the formula." });
        },
        onError: (err: any) => {
            toast({ title: "Validation Error", description: err.message, variant: "destructive" });
        }
    });

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Formula Yield Engine</h1>
                    <p className="text-muted-foreground mt-1">Define Co-Products and By-Products resulting from a single process manufacturing batch.</p>
                </div>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !selectedFormulaId}>
                    <Save className="w-4 h-4 mr-2" /> Save Yield Rules
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Beaker className="w-5 h-5 text-indigo-500" /> Source Formula Selection</CardTitle>
                    <CardDescription>Select the base formula to attach yield routing to.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-w-md space-y-2">
                        <Label>Process Formula</Label>
                        <Select value={selectedFormulaId} onValueChange={setSelectedFormulaId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a formula..." />
                            </SelectTrigger>
                            <SelectContent>
                                {formulas?.map((f: any) => (
                                    <SelectItem key={f.id} value={f.id}>{f.name} ({f.id})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {selectedFormulaId && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2"><Factory className="w-5 h-5 text-green-600" /> Expected Outputs & Yields</CardTitle>
                            <CardDescription>Map the output percentages. One Primary product is required.</CardDescription>
                        </div>
                        <div className={`px-3 py-1 text-sm font-bold rounded ${totalAllocation === 100 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            Total Allocation: {totalAllocation}%
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Output Item</TableHead>
                                    <TableHead>Yield Type</TableHead>
                                    <TableHead className="text-right">Allocation %</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {outputs.map((out, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>
                                            <Select value={out.itemId} onValueChange={(v) => handleUpdateOutput(idx, "itemId", v)}>
                                                <SelectTrigger className="w-[300px]">
                                                    <SelectValue placeholder="Select output item" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {inventory.map((i: any) => (
                                                        <SelectItem key={i.id} value={i.id}>{i.itemName} ({i.sku})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Select value={out.yieldType} onValueChange={(v) => handleUpdateOutput(idx, "yieldType", v)}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PRIMARY">Primary Product</SelectItem>
                                                    <SelectItem value="CO_PRODUCT">Co-Product</SelectItem>
                                                    <SelectItem value="BY_PRODUCT">By-Product (Waste/Scrap)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end relative">
                                                <Input
                                                    type="number"
                                                    className="w-[100px] pr-8 text-right"
                                                    value={out.allocationPercentage}
                                                    onChange={(e) => handleUpdateOutput(idx, "allocationPercentage", parseFloat(e.target.value) || 0)}
                                                />
                                                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => removeOutput(idx)} className="text-muted-foreground hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="pt-2">
                            <Button variant="outline" size="sm" onClick={addOutput} className="border-dashed">
                                <Plus className="w-4 h-4 mr-2" /> Add Co-Product / By-Product
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
