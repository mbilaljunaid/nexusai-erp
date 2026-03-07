import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription
} from "@/components/ui/sheet";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Library, ChevronRight, ChevronDown, Folder, FileText } from "lucide-react";
import { StandardTable, Column } from "../tables/StandardTable";
import { cn } from "@/lib/utils";
import type { CostCode } from "@/types/erp-types";

interface CostCodeWithChildren extends CostCode {
    children?: CostCodeWithChildren[];
}

export default function ConstructionCostCodeLibrary() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingCode, setEditingCode] = useState<CostCode | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    const { data: costCodes = [], isLoading } = useQuery<CostCode[]>({
        queryKey: ["construction-cost-codes"],
        queryFn: async () => {
            const res = await fetch("/api/construction/cost-codes");
            if (!res.ok) throw new Error("Failed to fetch cost codes");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/construction/cost-codes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-cost-codes"] });
            setIsAddOpen(false);
            toast({ title: "Success", description: "Cost code added to library." });
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            const res = await fetch(`/api/construction/cost-codes/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-cost-codes"] });
            setEditingCode(null);
            toast({ title: "Success", description: "Cost code updated." });
        }
    });

    const columns: Column<CostCode>[] = [
        { header: "Code", accessorKey: "code", sortable: true },
        { header: "Name", accessorKey: "name", sortable: true },
        { header: "Category", accessorKey: "category", sortable: true },
        { header: "Description", accessorKey: "description" },
    ];

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            code: formData.get("code"),
            name: formData.get("name"),
            category: formData.get("category"),
            description: formData.get("description"),
            parentId: formData.get("parentId") || null,
        };

        if (editingCode) {
            updateMutation.mutate({ id: editingCode.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    // Build hierarchical tree structure
    const buildTree = (codes: CostCode[]): CostCodeWithChildren[] => {
        const map = new Map<string, CostCodeWithChildren>();
        const roots: CostCodeWithChildren[] = [];

        // Create map of all codes
        codes.forEach(code => {
            map.set(code.id, { ...code, children: [] });
        });

        // Build tree structure
        codes.forEach(code => {
            const node = map.get(code.id)!;
            if (code.parentId && map.has(code.parentId)) {
                const parent = map.get(code.parentId)!;
                parent.children!.push(node);
            } else {
                roots.push(node);
            }
        });

        return roots;
    };

    const toggleNode = (id: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedNodes(newExpanded);
    };

    const renderTreeNode = (node: CostCodeWithChildren, level: number = 0) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedNodes.has(node.id);

        return (
            <div key={node.id}>
                <div
                    className={cn(
                        "flex items-center gap-2 py-2 px-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors",
                        level > 0 && "ml-6"
                    )}
                    style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
                >
                    <div className="flex-1 flex items-center gap-2">
                        {hasChildren ? (
                            <button
                                onClick={() => toggleNode(node.id)}
                                className="p-0 h-5 w-5 flex items-center justify-center hover:bg-muted rounded"
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                            </button>
                        ) : (
                            <div className="w-5" />
                        )}

                        {hasChildren ? (
                            <Folder className="h-4 w-4 text-blue-600" />
                        ) : (
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        )}

                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold text-sm">{node.code}</span>
                                <span className="text-sm">{node.name}</span>
                            </div>
                            {node.description && (
                                <div className="text-xs text-muted-foreground">{node.description}</div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingCode(node as CostCode);
                            }} aria-label="Edit"
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div>
                        {node.children!.map(child => renderTreeNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    const hierarchicalData = buildTree(costCodes);

    return (
        <div className="p-6 space-y-6">
            <Breadcrumbs items={[
                { label: "ERP", path: "/erp" },
                { label: "Construction", path: "/construction/insights" },
                { label: "Cost Codes", path: "/construction/cost-codes" }
            ]} />
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cost Code Library</h1>
                    <p className="text-muted-foreground">Manage standard CSI MasterFormat and regional cost codes with hierarchical organization.</p>
                </div>

                <Sheet open={isAddOpen || !!editingCode} onOpenChange={(open) => {
                    if (!open) {
                        setIsAddOpen(false);
                        setEditingCode(null);
                    }
                }}>
                    <SheetTrigger asChild>
                        <Button onClick={() => setIsAddOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Cost Code
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <SheetHeader>
                            <SheetTitle>{editingCode ? "Edit Cost Code" : "Add New Cost Code"}</SheetTitle>
                            <SheetDescription>Configure a standard cost code for use across the enterprise.</SheetDescription>
                        </SheetHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="code">Code *</Label>
                                <Input id="code" name="code" defaultValue={editingCode?.code || ""} placeholder="e.g. 03-30-00" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input id="name" name="name" defaultValue={editingCode?.name || ""} placeholder="e.g. Cast-in-Place Concrete" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" name="category" defaultValue={editingCode?.category || ""} placeholder="e.g. Division 03" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="parentId">Parent Cost Code (optional)</Label>
                                <Select name="parentId" defaultValue={editingCode?.parentId || ""}>
                                    <SelectTrigger id="parentId">
                                        <SelectValue placeholder="Select parent (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">None (Root Level)</SelectItem>
                                        {costCodes
                                            .filter(c => c.id !== editingCode?.id)
                                            .map(code => (
                                                <SelectItem key={code.id} value={code.id}>
                                                    {code.code} - {code.name}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" name="description" defaultValue={editingCode?.description || ""} />
                            </div>
                            <SheetFooter className="pt-4">
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full">
                                    {editingCode ? "Update" : "Create"}
                                </Button>
                            </SheetFooter>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            <Tabs defaultValue="hierarchy" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="hierarchy">Hierarchical View</TabsTrigger>
                    <TabsTrigger value="table">Table View</TabsTrigger>
                </TabsList>

                <TabsContent value="hierarchy">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Library className="h-5 w-5 text-primary" />
                                <CardTitle>Cost Code Hierarchy</CardTitle>
                            </div>
                            <CardDescription>Expandable tree view showing parent-child relationships</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-10 text-muted-foreground">Loading cost codes...</div>
                            ) : hierarchicalData.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    No cost codes found. Click "Add Cost Code" to create one.
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {hierarchicalData.map(node => renderTreeNode(node))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="table">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Library className="h-5 w-5 text-primary" />
                                <CardTitle>Master Cost Codes</CardTitle>
                            </div>
                            <CardDescription>Flat table view of all cost codes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StandardTable
                                data={costCodes}
                                columns={columns}
                                isLoading={isLoading}
                                actions={(item: CostCode) => (
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingCode(item)} aria-label="Edit">
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label="Delete">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                )}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
