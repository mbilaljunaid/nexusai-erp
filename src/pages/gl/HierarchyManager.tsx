
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Network } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { GlValueSet, GlSegmentValue, GlSegmentHierarchy } from "@shared/schema";

// Helper to build tree structure
type TreeNode = GlSegmentValue & { children: TreeNode[] };

function buildTree(values: GlSegmentValue[], hierarchies: GlSegmentHierarchy[]): TreeNode[] {
    const valueMap = new Map<string, TreeNode>();
    values.forEach(v => valueMap.set(v.value, { ...v, children: [] }));

    const roots: TreeNode[] = [];
    // Identify children
    const childValues = new Set(hierarchies.map(h => h.childValue));

    // Iterate hierarchies to link parents
    hierarchies.forEach(h => {
        const parent = valueMap.get(h.parentValue);
        const child = valueMap.get(h.childValue);
        if (parent && child) {
            parent.children.push(child);
        }
    });

    // Find roots (items not in child set, or explicitly parent nodes without parents in this set)
    // Actually, any hierarchy definition makes a parent-child link.
    // Roots are values that are NOT appearing as 'childValue' in the hierarchy list 
    // BUT are part of the hierarchy (appear as parentValue).
    // Or simpler: Just values that are 'isSummary' and have no parent in hierarchy table.

    // For now, let's just list the defined relationships in a table, 
    // but a Tree View is better.
    // Let's stick to a Table of "Parent -> Child" for MVP ensuring data integrity first.
    return [];
}

export default function HierarchyManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedValueSetId, setSelectedValueSetId] = useState<string>("");

    const [newRelation, setNewRelation] = useState({
        parentValue: "",
        childValue: "",
        treeName: "DEFAULT"
    });

    // 1. Fetch Value Sets
    const { data: valueSets = [] } = useQuery<GlValueSet[]>({
        queryKey: ["/api/finance/gl/value-sets"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/finance/gl/value-sets");
            return res.json();
        }
    });

    // 2. Fetch Values for Selected Set
    const { data: values = [] } = useQuery<GlSegmentValue[]>({
        queryKey: ["/api/finance/gl/segment-values", selectedValueSetId],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/finance/gl/segment-values?valueSetId=${selectedValueSetId}`);
            return res.json();
        },
        enabled: !!selectedValueSetId
    });

    // 3. Fetch Hierarchies
    const { data: hierarchies = [], isLoading } = useQuery<GlSegmentHierarchy[]>({
        queryKey: ["/api/finance/gl/segment-hierarchies", selectedValueSetId],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/finance/gl/segment-hierarchies?valueSetId=${selectedValueSetId}`);
            return res.json();
        },
        enabled: !!selectedValueSetId
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            return apiRequest("POST", "/api/finance/gl/segment-hierarchies", { ...data, valueSetId: selectedValueSetId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/finance/gl/segment-hierarchies", selectedValueSetId] });
            setNewRelation({ ...newRelation, childValue: "" }); // Keep parent for rapid entry
            toast({ title: "Relationship Added", description: "Hierarchy node created." });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const handleAdd = () => {
        if (!newRelation.parentValue || !newRelation.childValue) return;
        if (newRelation.parentValue === newRelation.childValue) {
            toast({ title: "Invalid", description: "Parent and Child cannot be the same.", variant: "destructive" });
            return;
        }
        createMutation.mutate(newRelation);
    };

    // Filter values for Parent/Child dropdowns
    const summaryValues = values.filter(v => v.isSummary);
    // Any value can be a child technically, but practically detail values are leaves.
    const allValues = values;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Hierarchy Manager</h1>
                    <p className="text-muted-foreground mt-2">
                        Define parent-child relationships for account rollup and reporting.
                    </p>
                </div>
            </div>

            <Card className="bg-slate-50 dark:bg-slate-900">
                <CardHeader>
                    <CardTitle>Select Value Set</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={selectedValueSetId} onValueChange={setSelectedValueSetId}>
                        <SelectTrigger className="max-w-md">
                            <SelectValue placeholder="Choose a Value Set..." />
                        </SelectTrigger>
                        <SelectContent>
                            {valueSets.map(vs => (
                                <SelectItem key={vs.id} value={vs.id}>{vs.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {selectedValueSetId && (
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Add Relationship Form */}
                    <Card className="md:col-span-1 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Add Relationship
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tree Version</label>
                                <Select
                                    value={newRelation.treeName}
                                    onValueChange={(val) => setNewRelation({ ...newRelation, treeName: val })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DEFAULT">Default</SelectItem>
                                        <SelectItem value="V2026">2026 Version</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Parent Node (Summary)</label>
                                <Select
                                    value={newRelation.parentValue}
                                    onValueChange={(val) => setNewRelation({ ...newRelation, parentValue: val })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select Parent" /></SelectTrigger>
                                    <SelectContent>
                                        {summaryValues.length === 0 ? (
                                            <SelectItem value="none" disabled>No Summary Values defined</SelectItem>
                                        ) : (
                                            summaryValues.map(v => (
                                                <SelectItem key={v.id} value={v.value}>{v.value} - {v.description}</SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">Only 'Summary' values can be parents.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Child Node</label>
                                <Select
                                    value={newRelation.childValue}
                                    onValueChange={(val) => setNewRelation({ ...newRelation, childValue: val })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select Child" /></SelectTrigger>
                                    <SelectContent>
                                        {allValues.map(v => (
                                            <SelectItem key={v.id} value={v.value}>{v.value} - {v.description}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button onClick={handleAdd} disabled={createMutation.isPending} className="w-full mt-4">
                                Link Nodes
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Hierarchy Table */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Network className="h-5 w-5" /> Active Hierarchy ({newRelation.treeName})
                            </CardTitle>
                            <CardDescription>
                                {hierarchies.length} relationships defined.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Parent</TableHead>
                                        <TableHead>Child</TableHead>
                                        <TableHead>Tree</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
                                    ) : hierarchies.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No relationships defined yet.</TableCell></TableRow>
                                    ) : (
                                        hierarchies.map(h => (
                                            <TableRow key={h.id}>
                                                <TableCell className="font-semibold">{h.parentValue}</TableCell>
                                                <TableCell>{h.childValue}</TableCell>
                                                <TableCell><Badge variant="outline">{h.treeName}</Badge></TableCell>
                                                <TableCell className="text-right text-muted-foreground text-xs">Active</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
