import React, { useState } from 'react';
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Button } from "@/components/ui/button";
import { Plus, Save, FileText, Settings, FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

interface Recipe {
    id: string;
    recipeNumber: string;
    name: string;
    description?: string;
    formulaId: string;
    routingId?: string;
    status: "active" | "draft" | "obsolete";
    createdAt: string;
}

export default function RecipeManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Form State
    const [recipeNumber, setRecipeNumber] = useState("");
    const [recipeName, setRecipeName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedFormula, setSelectedFormula] = useState("");
    const [selectedRouting, setSelectedRouting] = useState("");

    const { data: recipes = [], isLoading } = useQuery<Recipe[]>({
        queryKey: ["/api/manufacturing/recipes"],
        queryFn: async () => {
            const res = await fetch("/api/manufacturing/recipes");
            if (!res.ok) throw new Error("Failed to fetch recipes");
            return res.json();
        }
    });

    // Lookup Data
    const { data: formulasData } = useQuery<any>({
        queryKey: ["/api/manufacturing/formulas"],
        queryFn: async () => {
            const res = await fetch("/api/manufacturing/formulas?limit=100");
            return res.json();
        }
    });
    const formulas = formulasData?.items || formulasData || []; // Handle pagination wrapper if present or array

    const { data: routings = [] } = useQuery<any[]>({
        queryKey: ["/api/manufacturing/routings"],
        queryFn: async () => {
            const res = await fetch("/api/manufacturing/routings");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/manufacturing/recipes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to save Recipe");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/manufacturing/recipes"] });
            setIsSheetOpen(false);
            resetForm();
            toast({ title: "Success", description: "Process Recipe saved successfully" });
        },
        onError: (err) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const resetForm = () => {
        setRecipeNumber("");
        setRecipeName("");
        setDescription("");
        setSelectedFormula("");
        setSelectedRouting("");
    };

    const handleSave = () => {
        if (!recipeNumber || !recipeName || !selectedFormula) {
            toast({ title: "Validation Error", description: "Recipe Number, Name, and Formula are required", variant: "destructive" });
            return;
        }

        createMutation.mutate({
            recipeNumber,
            name: recipeName,
            description,
            formulaId: selectedFormula,
            routingId: selectedRouting || null,
            status: "active"
        });
    };

    const columns: Column<Recipe>[] = [
        {
            header: "Recipe ID",
            accessorKey: "recipeNumber",
            cell: (row) => <span className="font-mono font-bold text-indigo-700">{row.recipeNumber}</span>
        },
        {
            header: "Recipe Name",
            accessorKey: "name",
            cell: (row) => (
                <div>
                    <div className="font-medium">{row.name}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[200px]">{row.description}</div>
                </div>
            )
        },
        {
            header: "Formula",
            accessorKey: "formulaId",
            cell: (row) => {
                const f = Array.isArray(formulas) ? formulas.find((x: any) => x.id === row.formulaId) : null;
                return (
                    <div className="flex items-center gap-2">
                        <FlaskConical className="h-3 w-3 text-slate-400" />
                        <span className="text-sm">{f?.name || row.formulaId}</span>
                    </div>
                );
            }
        },
        {
            header: "Routing",
            accessorKey: "routingId",
            cell: (row) => {
                const r = routings.find(x => x.id === row.routingId);
                return row.routingId ? (
                    <div className="flex items-center gap-2">
                        <Settings className="h-3 w-3 text-slate-400" />
                        <span className="text-sm">{r?.routingNumber || "Standard Routing"}</span>
                    </div>
                ) : <span className="text-slate-400 text-xs italic">No routing linked</span>;
            }
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row) => (
                <Badge variant={row.status === "active" ? "default" : "secondary"}>
                    {row.status.toUpperCase()}
                </Badge>
            )
        }
    ];

    return (
        <StandardPage
            title="Process Recipes"
            breadcrumbs={[
                { label: "Manufacturing", href: "/manufacturing" },
                { label: "Process Manufacturing" },
                { label: "Recipes" }
            ]}
            actions={
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button onClick={() => { resetForm(); setIsSheetOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="mr-2 h-4 w-4" /> New Recipe
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-md">
                        <SheetHeader>
                            <SheetTitle>Create Process Recipe</SheetTitle>
                            <SheetDescription>
                                Bind a specific Formula (Ingredients) to a Routing (Process Steps) to maintain versioned production recipes.
                            </SheetDescription>
                        </SheetHeader>

                        <div className="space-y-4 mt-6">
                            <div className="space-y-2">
                                <Label>Recipe Code</Label>
                                <Input
                                    value={recipeNumber}
                                    onChange={e => setRecipeNumber(e.target.value)}
                                    placeholder="REC-2024-001"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Recipe Name</Label>
                                <Input
                                    value={recipeName}
                                    onChange={e => setRecipeName(e.target.value)}
                                    placeholder="Standard Batch Process A"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Production details..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-indigo-600 font-semibold">Formula (Ingredients)</Label>
                                <Select value={selectedFormula} onValueChange={setSelectedFormula}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Formula" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.isArray(formulas) && formulas.map((f: any) => (
                                            <SelectItem key={f.id} value={f.id}>
                                                {f.formulaCode} - {f.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Routing (Process Steps)</Label>
                                <Select value={selectedRouting} onValueChange={setSelectedRouting}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Routing (Optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {routings.map(r => (
                                            <SelectItem key={r.id} value={r.id}>
                                                {r.routingNumber}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                                <Button onClick={handleSave} disabled={createMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                                    <Save className="mr-2 h-4 w-4" /> Save Recipe
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            }
        >
            <div className="bg-white rounded-lg border shadow-sm">
                <StandardTable
                    data={recipes}
                    columns={columns}
                    isLoading={isLoading}
                    keyExtractor={item => item.id}
                    filterColumn="name"
                    filterPlaceholder="Search recipes..."
                />
            </div>
        </StandardPage>
    );
}
